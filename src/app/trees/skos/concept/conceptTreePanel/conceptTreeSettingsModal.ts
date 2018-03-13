import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { SKOS } from "../../../../models/Vocabulary";
import { ConceptTreePreference } from "../../../../models/Properties";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { VBProperties } from "../../../../utils/VBProperties";
// import { VBContext } from "../../../utils/VBContext";
// import { Cookie } from "../../../utils/Cookie";

@Component({
    selector: "concept-tree-settings-modal",
    templateUrl: "./conceptTreeSettingsModal.html",
})
export class ConceptTreeSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private pristineConcPref: ConceptTreePreference;

    private broaderProperty: ARTURIResource;

    constructor(public dialog: DialogRef<BSModalContext>, private resourceService: ResourcesServices, 
        private vbProp: VBProperties, private basicModals: BasicModalServices , private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let conceptTreePref: ConceptTreePreference = this.vbProp.getConceptTreePreferences();
        this.pristineConcPref = JSON.parse(JSON.stringify(conceptTreePref));
        this.resourceService.getResourceDescription(new ARTURIResource(conceptTreePref.baseBroaderUri)).subscribe(
            res => {
                this.broaderProperty = <ARTURIResource>res;
            }
        );
    }

    /**
     * ROOT CLASS HANDLERS
     */

    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select root class", [SKOS.broader]).then(
            (prop: ARTURIResource) => {
                this.broaderProperty = prop;
            },
            () => {}
        );
    }

    private updateBroaderProp(propURI: string) {
        let prop: ARTURIResource = new ARTURIResource(propURI, null, RDFResourceRolesEnum.objectProperty);
        //check if clsURI exist
        this.resourceService.getResourcePosition(prop).subscribe(
            position => {
                if (position.startsWith("local:")) {
                    this.broaderProperty = prop;
                } else {
                    this.basicModals.alert("Error", "Wrong URI: no resource with URI " + prop.getNominalValue() + " exists in the current project", "error");
                    //temporarly reset the broader property and the restore it (in order to trigger the change detection editable-input)
                    let oldBroaderProp = this.broaderProperty;
                    this.broaderProperty = null;
                    setTimeout(() => this.broaderProperty = oldBroaderProp);
                }
            }
        );
    }


    ok(event: Event) {
        if (this.pristineConcPref.baseBroaderUri != this.broaderProperty.getURI()) {
            this.vbProp.setConceptTreeBroaderProp(this.broaderProperty.getURI());
        }

        //only if the broader prop changed close the dialog (so that the concept tree refresh)
        if (this.pristineConcPref.baseBroaderUri != this.broaderProperty.getURI()) {
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