import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
import { ConceptTreePreference, ConceptTreeVisualizationMode } from "../../../../models/Properties";
import { SKOS } from "../../../../models/Vocabulary";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { VBProperties } from "../../../../utils/VBProperties";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "concept-tree-settings-modal",
    templateUrl: "./conceptTreeSettingsModal.html",
})
export class ConceptTreeSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private pristineConcPref: ConceptTreePreference;

    private baseBroaderProp: string;

    private broaderProps: ARTURIResource[] = [];
    private narrowerProps: ARTURIResource[] = [];
    private includeSubProps: boolean
    private syncInverse: boolean;

    private selectedBroader: ARTURIResource;
    private selectedNarrower: ARTURIResource;

    private visualization: ConceptTreeVisualizationMode;
    private visualizationModes: { label: string, value: ConceptTreeVisualizationMode }[] = [
        { label: "Hierarchy based", value: ConceptTreeVisualizationMode.hierarchyBased },
        { label: "Search based", value: ConceptTreeVisualizationMode.searchBased }
    ]

    constructor(public dialog: DialogRef<BSModalContext>, private resourceService: ResourcesServices, private propService: PropertyServices,
        private vbProp: VBProperties, private basicModals: BasicModalServices , private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let conceptTreePref: ConceptTreePreference = this.vbProp.getConceptTreePreferences();
        this.pristineConcPref = JSON.parse(JSON.stringify(conceptTreePref));
        
        this.baseBroaderProp = conceptTreePref.baseBroaderUri;

        //init broader properties
        if (conceptTreePref.broaderProps.length > 0) {
            conceptTreePref.broaderProps.forEach(
                (propUri: string) => {
                    this.broaderProps.push(new ARTURIResource(propUri));
                }
            );
            this.resourceService.getResourcesInfo(this.broaderProps).subscribe(
                resources => {
                    resources.forEach(
                        (res: ARTURIResource) => {
                            for (var i = 0; i < this.broaderProps.length; i++) {
                                if (res.getURI() == this.broaderProps[i].getURI()) {
                                    this.broaderProps[i] = res;
                                    break;
                                }
                            }
                        }
                    );
                }
            );
        }

        //init narrower properties
        if (conceptTreePref.narrowerProps.length > 0) {
            conceptTreePref.narrowerProps.forEach(
                (propUri: string) => {
                    this.narrowerProps.push(new ARTURIResource(propUri));
                }
            );
            this.resourceService.getResourcesInfo(this.narrowerProps).subscribe(
                resources => {
                    resources.forEach(
                        (res: ARTURIResource) => {
                            for (var i = 0; i < this.narrowerProps.length; i++) {
                                if (res.getURI() == this.narrowerProps[i].getURI()) {
                                    this.narrowerProps[i] = res;
                                    break;
                                }
                            }
                        }
                    );
                }
            );
        }

        this.includeSubProps = conceptTreePref.includeSubProps;
        this.syncInverse = conceptTreePref.syncInverse;

        this.visualization = conceptTreePref.visualization;

    }

    /**
     * BASE BROADER HANDLERS
     */

    private changeBaseBroaderProperty() {
        this.browsingModals.browsePropertyTree("Select root class", [SKOS.broader]).then(
            (prop: ARTURIResource) => {
                this.baseBroaderProp = prop.getURI();
            },
            () => {}
        );
    }

    private updateBaseBroaderProp(propURI: string) {
        let prop: ARTURIResource = new ARTURIResource(propURI, null, RDFResourceRolesEnum.objectProperty);
        //check if clsURI exist
        this.resourceService.getResourcePosition(prop).subscribe(
            position => {
                if (position.startsWith("local:")) {
                    this.baseBroaderProp = prop.getURI();
                    // this.broaderProperty = prop;
                } else {
                    this.basicModals.alert("Error", "Wrong URI: no resource with URI " + prop.getNominalValue() + " exists in the current project", "error");
                    //temporarly reset the broader property and the restore it (in order to trigger the change detection editable-input)
                    let oldBroaderProp = this.baseBroaderProp;
                    this.baseBroaderProp = null;
                    setTimeout(() => this.baseBroaderProp = oldBroaderProp);
                }
            }
        );
    }

    /**
     * BROADER/NARROWER PROPRETIES
     */

    private addBroader() {
        this.browsingModals.browsePropertyTree("Select a broader property", [SKOS.broader]).then(
            (prop: ARTURIResource) => {
                if (!ResourceUtils.containsNode(this.broaderProps, prop)) {
                    this.broaderProps.push(prop);
                    //if synchronization is active sync the lists
                    if (this.syncInverse) {
                        this.syncProps();
                    }
                }
            },
            () => {}
        )
    }

    private addNarrower() {
        this.browsingModals.browsePropertyTree("Select a narrower property", [SKOS.narrower]).then(
            (prop: ARTURIResource) => {
                if (!ResourceUtils.containsNode(this.narrowerProps, prop)) {
                    this.narrowerProps.push(prop);
                    //if synchronization is active sync the lists
                    if (this.syncInverse) {
                        this.syncProps();
                    }
                }
            },
            () => {}
        )
    }

    private removeBroader() {
        this.broaderProps.splice(this.broaderProps.indexOf(this.selectedBroader), 1);
        //if synchronization is active sync the lists
        if (this.syncInverse) {
            this.propService.getInverseProperties([this.selectedBroader]).subscribe(
                (inverseProps: ARTURIResource[]) => {
                    if (inverseProps.length > 0) {
                        let idx = ResourceUtils.indexOfNode(this.narrowerProps, inverseProps[0]);
                        if (idx != -1) {
                            this.narrowerProps.splice(idx, 1);
                        }
                    }
                }
            );
        }
        this.selectedBroader = null;
    }

    private removeNarrower() {
        this.narrowerProps.splice(this.narrowerProps.indexOf(this.selectedNarrower), 1);
        //if synchronization is active sync the lists
        if (this.syncInverse) {
            this.propService.getInverseProperties([this.selectedNarrower]).subscribe(
                (inverseProps: ARTURIResource[]) => {
                    if (inverseProps.length > 0) {
                        let idx = ResourceUtils.indexOfNode(this.broaderProps, inverseProps[0]);
                        if (idx != -1) {
                            this.broaderProps.splice(idx, 1);
                        }
                    }
                }
            );
        }
        this.selectedNarrower = null;
    }

    private onSyncChange() {
        //if sync inverse properties change from false to true perform a sync
        if (this.syncInverse) {
            this.syncProps();
        }
    }

    private syncProps() {
        if (this.broaderProps.length > 0) {
            this.propService.getInverseProperties(this.broaderProps).subscribe(
                (inverseProps: ARTURIResource[]) => {
                    inverseProps.forEach((narrowerProp: ARTURIResource) => {
                        if (!ResourceUtils.containsNode(this.narrowerProps, narrowerProp)) { //invers is not already among the narrowerProps
                            let broaderPropUri: string = narrowerProp.getAdditionalProperty("inverseOf");
                            //add it at the same index of its inverse prop
                            let idx: number = ResourceUtils.indexOfNode(this.broaderProps, new ARTURIResource(broaderPropUri));
                            this.narrowerProps.splice(idx, 0, narrowerProp);
                        }
                    });
                }
            )
        }
        if (this.narrowerProps.length > 0) {
            this.propService.getInverseProperties(this.narrowerProps).subscribe(
                (inverseProps: ARTURIResource[]) => {
                    inverseProps.forEach((broaderProp: ARTURIResource) => {
                        if (!ResourceUtils.containsNode(this.broaderProps, broaderProp)) { //invers is not already among the broaderProps
                            let narrowerPropUri: string = broaderProp.getAdditionalProperty("inverseOf");
                            //add it at the same index of its inverse prop
                            let idx: number = ResourceUtils.indexOfNode(this.narrowerProps, new ARTURIResource(narrowerPropUri));
                            this.broaderProps.splice(idx, 0, broaderProp);
                        }
                    });
                }
            )
        }
    }

    //=======================


    ok(event: Event) {
        if (this.pristineConcPref.visualization != this.visualization) {
            this.vbProp.setConceptTreeVisualization(this.visualization);
        }

        let broaderPropsChanged: boolean = false;
        let narrowerPropsChanged: boolean = false;

        if (this.visualization == ConceptTreeVisualizationMode.hierarchyBased) {
            if (this.pristineConcPref.baseBroaderUri != this.baseBroaderProp) {
                this.vbProp.setConceptTreeBaseBroaderProp(this.baseBroaderProp);
            }

            if (this.pristineConcPref.includeSubProps != this.includeSubProps) {
                this.vbProp.setConceptTreeIncludeSubProps(this.includeSubProps);
            }

            if (this.pristineConcPref.syncInverse != this.syncInverse) {
                this.vbProp.setConceptTreeSyncInverse(this.syncInverse);
            }

            //look for changes in broaderProps:
            //first compare lenght
            if (this.pristineConcPref.broaderProps.length != this.broaderProps.length) {
                broaderPropsChanged = true;
            }
            //eventually check if every property in the pristine collection is still in the current collection (properties removed?)...
            if (!broaderPropsChanged) {
                for (var i = 0; i < this.pristineConcPref.broaderProps.length; i++) {
                    let propUri: string = this.pristineConcPref.broaderProps[i];
                    if (!ResourceUtils.containsNode(this.broaderProps, new ARTURIResource(propUri))) {
                        broaderPropsChanged = true; //current properties collection doesn't contain a property of the pristine collection
                        break;
                    }
                }
            }
            //...and finally check if every property in the current was in the pristine (properties added?)
            if (!broaderPropsChanged) {
                for (var i = 0; i < this.broaderProps.length; i++) {
                    if (this.pristineConcPref.broaderProps.indexOf(this.broaderProps[i].getURI()) == -1) {
                        broaderPropsChanged = true; //pristine properties collection doesn't contain a property of the current collection
                        break;
                    }
                }
            }
            if (broaderPropsChanged) {
                let broaderPropsPref: string[] = [];
                this.broaderProps.forEach((prop: ARTURIResource) => broaderPropsPref.push(prop.getURI()));
                this.vbProp.setConceptTreeBroaderProps(broaderPropsPref);
            }

            //look for changes in narrowerProps:
            //first compare lenght
            if (this.pristineConcPref.narrowerProps.length != this.narrowerProps.length) {
                narrowerPropsChanged = true;
            }
            //eventually check if every property in the pristine collection is still in the current collection (properties removed?)...
            if (!narrowerPropsChanged) {
                for (var i = 0; i < this.pristineConcPref.narrowerProps.length; i++) {
                    let propUri: string = this.pristineConcPref.narrowerProps[i];
                    if (!ResourceUtils.containsNode(this.narrowerProps, new ARTURIResource(propUri))) {
                        narrowerPropsChanged = true; //current properties collection doesn't contain a property of the pristine collection
                        break;
                    }
                }
            }
            //...and finally check if every property in the current was in the pristine (properties added?)
            if (!narrowerPropsChanged) {
                for (var i = 0; i < this.narrowerProps.length; i++) {
                    if (this.pristineConcPref.narrowerProps.indexOf(this.narrowerProps[i].getURI()) == -1) {
                        narrowerPropsChanged = true; //pristine properties collection doesn't contain a property of the current collection
                        break;
                    }
                }
            }
            if (narrowerPropsChanged) {
                let narrowerPropsPref: string[] = [];
                this.narrowerProps.forEach((prop: ARTURIResource) => narrowerPropsPref.push(prop.getURI()));
                this.vbProp.setConceptTreeNarrowerProps(narrowerPropsPref);
            }
        }

        /**
         * close the dialog if one of the following settings changed
         * - the broader/narrower props
         * - includeSubProps 
         * - visualization
         * so that the concept tree refresh
         */
        if (
            broaderPropsChanged || narrowerPropsChanged || this.pristineConcPref.includeSubProps != this.includeSubProps ||
            this.pristineConcPref.visualization != this.visualization
        ) {
            event.stopPropagation();
            event.preventDefault();
            this.dialog.close();
        } else {//for other changes simply dismiss the modal
            this.cancel();
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}