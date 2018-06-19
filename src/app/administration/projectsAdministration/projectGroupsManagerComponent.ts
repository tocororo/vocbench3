import { Component, Input, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils } from "../../models/ARTResources";
import { Project } from "../../models/Project";
import { Properties } from "../../models/Properties";
import { UsersGroup } from "../../models/User";
import { OntoLex, SKOS } from "../../models/Vocabulary";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { PropertyServices } from "../../services/propertyServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { UsersGroupsServices } from "../../services/usersGroupsServices";
import { HttpServiceContext } from "../../utils/HttpManager";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "project-groups-manager",
    templateUrl: "./projectGroupsManagerComponent.html",
})
export class ProjectGroupsManagerComponent {

    @Input() project: Project;
    private projectClosed: boolean;

    private groups: UsersGroup[]; //list of groups
    private selectedGroup: UsersGroup; //group selected in the list of groups

    private baseBroaderProp: string = SKOS.broader.getURI();
    private broaderProps: ARTURIResource[] = [];
    private narrowerProps: ARTURIResource[] = [];
    private includeSubProps: boolean;
    private syncInverse: boolean;

    private selectedBroader: ARTURIResource;
    private selectedNarrower: ARTURIResource;

    private ownedSchemes: ARTURIResource[] = [];
    private selectedScheme: ARTURIResource;

    constructor(private groupsService: UsersGroupsServices, private prefService: PreferencesSettingsServices,
        private resourceService: ResourcesServices, private propService: PropertyServices,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) { }

    ngOnInit() {
        this.groupsService.listGroups().subscribe(
            groups => {
                this.groups = groups;
            }
        )
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            if (this.selectedGroup) {
                this.initSettings();
            }
        }
    }

    private isProjectSkosCompliant() {
        if (this.project != null) {
            let modelType = this.project.getModelType();
            return modelType == SKOS.uri || modelType == OntoLex.uri;
        }
    }

    private initSettings() {
        this.projectClosed = !this.project.isOpen();
        if (this.projectClosed) {
            return;
        }

        this.prepareProjectAccess(); //so that all the getResourcesInfo functions will have the current selected project as ctx_project

        /**
         * array of getResourcesInfo functions collected in the handlers of getPGSettings (for pref_concept_tree_broader_props 
         * and pref_concept_tree_narrower_props) and getProjectGroupBinding (for ownedSchemes) responses.
         */
        let describeFunctions: any[] = [];

        var properties: string[] = [
            Properties.pref_concept_tree_base_broader_prop, Properties.pref_concept_tree_broader_props,
            Properties.pref_concept_tree_narrower_props, Properties.pref_concept_tree_include_subprops, 
            Properties.pref_concept_tree_sync_inverse, Properties.pref_concept_tree_visualization
        ];

        let getPGSettingsFn = this.prefService.getPGSettings(properties, this.selectedGroup.iri, this.project).map(
            prefs => {
                let conceptTreeBaseBroaderPropPref: string = prefs[Properties.pref_concept_tree_base_broader_prop];
                if (conceptTreeBaseBroaderPropPref != null) {
                    this.baseBroaderProp = conceptTreeBaseBroaderPropPref;
                }

                let broaderPropsTemp: ARTURIResource[] = [];
                let conceptTreeBroaderPropsPref: string = prefs[Properties.pref_concept_tree_broader_props];
                if (conceptTreeBroaderPropsPref != null) {
                    let broaderPropsIri: string[] = conceptTreeBroaderPropsPref.split(",");
                    broaderPropsIri.forEach((propUri: string) => {
                        broaderPropsTemp.push(new ARTURIResource(propUri));
                    });
                }
                this.broaderProps = [];
                if (broaderPropsTemp.length > 0) {
                    let describeBroadersFn = this.resourceService.getResourcesInfo(broaderPropsTemp).map(
                        resources => {
                            this.broaderProps = resources;
                        }
                    );
                    describeFunctions.push(describeBroadersFn);
                }

                let narrowerPropsTemp: ARTURIResource[] = [];
                let conceptTreeNarrowerPropsPref: string = prefs[Properties.pref_concept_tree_narrower_props];
                if (conceptTreeNarrowerPropsPref != null) {
                    let narrowerPropsIri: string[] = conceptTreeNarrowerPropsPref.split(",");
                    narrowerPropsIri.forEach((propUri: string) => {
                        narrowerPropsTemp.push(new ARTURIResource(propUri));
                    });
                }
                this.narrowerProps = [];
                if (narrowerPropsTemp.length > 0) {
                    let describeNarrowersFn = this.resourceService.getResourcesInfo(narrowerPropsTemp).map(
                        resources => {
                            this.narrowerProps = resources;
                        }
                    );
                    describeFunctions.push(describeNarrowersFn);
                }

                this.includeSubProps = prefs[Properties.pref_concept_tree_include_subprops] != "false";
                this.syncInverse = prefs[Properties.pref_concept_tree_sync_inverse] != "false";
                
            }
        );

        let getPGBindingFn = this.groupsService.getProjectGroupBinding(this.project.getName(), this.selectedGroup.iri).map(
            binding => {
                let ownedSchemesTemp: ARTURIResource[] = [];
                if (binding.ownedSchemes != null) {
                    binding.ownedSchemes.forEach((schemeUri: string) => {
                        ownedSchemesTemp.push(new ARTURIResource(schemeUri));
                    });
                }
                this.ownedSchemes = [];
                if (ownedSchemesTemp.length > 0) {
                    let describeOwnedSchemesFn = this.resourceService.getResourcesInfo(ownedSchemesTemp).map(
                        resources => {
                            this.ownedSchemes = resources;
                        }
                    );
                    describeFunctions.push(describeOwnedSchemesFn);
                }
            }
        );

        Observable.forkJoin([getPGSettingsFn, getPGBindingFn]).subscribe(
            resp => {
                Observable.forkJoin(describeFunctions).subscribe(
                    resp => {
                        this.revokeProjectAccess(); //remove the ctx_project
                    }
                );
            }
        );
        
    }

    private selectGroup(group: UsersGroup) {
        this.selectedGroup = group;
        if (this.project != null) {
            this.initSettings();
        }
    }


    /**
     * BASE BROADER HANDLERS
     */

    private changeBaseBroaderProperty() {
        this.prepareProjectAccess();
        this.browsingModals.browsePropertyTree("Select root class", [SKOS.broader]).then(
            (prop: ARTURIResource) => {
                this.revokeProjectAccess();
                this.baseBroaderProp = prop.getURI();
                this.updateGroupSetting(Properties.pref_concept_tree_base_broader_prop, this.baseBroaderProp);
            },
            () => {}
        );
    }

    private updateBaseBroaderProp(propURI: string) {
        let prop: ARTURIResource = new ARTURIResource(propURI, null, RDFResourceRolesEnum.objectProperty);
        
        this.prepareProjectAccess();
        this.resourceService.getResourcePosition(prop).subscribe(
            position => {
                this.revokeProjectAccess();
                if (position.isLocal()) {
                    this.baseBroaderProp = prop.getURI();
                    this.updateGroupSetting(Properties.pref_concept_tree_base_broader_prop, this.baseBroaderProp);
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
        this.prepareProjectAccess();
        this.browsingModals.browsePropertyTree("Select a broader property", [SKOS.broader]).then(
            (prop: ARTURIResource) => {
                this.revokeProjectAccess();
                if (!ResourceUtils.containsNode(this.broaderProps, prop)) {
                    this.broaderProps.push(prop);
                    this.updateBroadersSetting();
                    //if synchronization is active sync the lists
                    if (this.syncInverse) {
                        this.syncInverseOfBroader().subscribe(
                            () => {
                                this.updateBroadersSetting();
                                this.updateNarrowersSetting();
                            }
                        )
                    } else {
                        this.updateBroadersSetting();
                    }
                }
            },
            () => {}
        )
    }

    private addNarrower() {
        this.prepareProjectAccess();
        this.browsingModals.browsePropertyTree("Select a narrower property", [SKOS.narrower]).then(
            (prop: ARTURIResource) => {
                this.revokeProjectAccess();
                if (!ResourceUtils.containsNode(this.narrowerProps, prop)) {
                    this.narrowerProps.push(prop);
                    //if synchronization is active sync the lists
                    if (this.syncInverse) {
                        this.syncInverseOfNarrower().subscribe(
                            () => { 
                                this.updateNarrowersSetting();
                                this.updateBroadersSetting();
                            }
                        )
                    } else {
                        this.updateNarrowersSetting();
                    }
                }
            },
            () => {}
        )
    }

    private removeBroader() {
        this.broaderProps.splice(this.broaderProps.indexOf(this.selectedBroader), 1);
        this.updateBroadersSetting();
        //if synchronization is active sync the lists
        if (this.syncInverse) {
            this.prepareProjectAccess();
            this.propService.getInverseProperties([this.selectedBroader]).subscribe(
                (inverseProps: ARTURIResource[]) => {
                    this.revokeProjectAccess();
                    let inverseUpdated: boolean = false;
                    inverseProps.forEach((narrowProp: ARTURIResource) => {
                        let idx = ResourceUtils.indexOfNode(this.narrowerProps, narrowProp);
                        if (idx != -1) {
                            this.narrowerProps.splice(idx, 1);
                            inverseUpdated = true;
                        }
                    });
                    if (inverseUpdated) {
                        this.updateNarrowersSetting();
                    }
                }
            );
        }
        this.selectedBroader = null;
    }

    private removeNarrower() {
        this.narrowerProps.splice(this.narrowerProps.indexOf(this.selectedNarrower), 1);
        this.updateNarrowersSetting();
        //if synchronization is active sync the lists
        if (this.syncInverse) {
            this.prepareProjectAccess();
            this.propService.getInverseProperties([this.selectedNarrower]).subscribe(
                (inverseProps: ARTURIResource[]) => {
                    this.revokeProjectAccess();
                    let inverseUpdated: boolean = false;
                    inverseProps.forEach((broaderProp: ARTURIResource) => {
                        let idx = ResourceUtils.indexOfNode(this.broaderProps, broaderProp);
                        if (idx != -1) {
                            this.broaderProps.splice(idx, 1);
                            inverseUpdated = true;
                        }
                    });
                    if (inverseUpdated) {
                        this.updateBroadersSetting();
                    }
                }
            );
        }
        this.selectedNarrower = null;
    }

    private onSyncChange() {
        //if sync inverse properties change from false to true perform a sync
        if (this.syncInverse) {
            this.syncInverseOfBroader().subscribe(
                () => {
                    this.updateNarrowersSetting();
                    this.syncInverseOfNarrower().subscribe(
                        () => {
                            this.updateBroadersSetting();
                        }
                    ); 
                }
            );
        }
    }

    private syncInverseOfBroader(): Observable<any> {
        if (this.broaderProps.length > 0) {
            this.prepareProjectAccess();
            return this.propService.getInverseProperties(this.broaderProps).map(
                (inverseProps: ARTURIResource[]) => {
                    this.revokeProjectAccess();
                    inverseProps.forEach((narrowerProp: ARTURIResource) => {
                        if (!ResourceUtils.containsNode(this.narrowerProps, narrowerProp)) { //invers is not already among the narrowerProps
                            let broaderPropUri: string = narrowerProp.getAdditionalProperty("inverseOf");
                            //add it at the same index of its inverse prop
                            let idx: number = ResourceUtils.indexOfNode(this.broaderProps, new ARTURIResource(broaderPropUri));
                            this.narrowerProps.splice(idx, 0, narrowerProp);
                        }
                    });
                }
            );
        } else {
            return Observable.of();
        }
    }

    private syncInverseOfNarrower(): Observable<any> {
        if (this.narrowerProps.length > 0) {
            this.prepareProjectAccess();
            return this.propService.getInverseProperties(this.narrowerProps).map(
                (inverseProps: ARTURIResource[]) => {
                    this.revokeProjectAccess();
                    inverseProps.forEach((broaderProp: ARTURIResource) => {
                        if (!ResourceUtils.containsNode(this.broaderProps, broaderProp)) { //invers is not already among the broaderProps
                            let narrowerPropUri: string = broaderProp.getAdditionalProperty("inverseOf");
                            //add it at the same index of its inverse prop
                            let idx: number = ResourceUtils.indexOfNode(this.narrowerProps, new ARTURIResource(narrowerPropUri));
                            this.broaderProps.splice(idx, 0, broaderProp);
                        }
                    });
                }
            );
        } else {
            return Observable.of();
        }
    }

    private onIncludeSubPropsChange() {
        this.updateGroupSetting(Properties.pref_concept_tree_include_subprops, this.includeSubProps+"");
    }


    private updateBroadersSetting() {
        let broaderPropsPref: string[] = [];
        this.broaderProps.forEach((prop: ARTURIResource) => broaderPropsPref.push(prop.getURI()));
        let prefValue: string;
        if (broaderPropsPref.length > 0) {
            prefValue = broaderPropsPref.join(",");
        }
        this.updateGroupSetting(Properties.pref_concept_tree_broader_props, prefValue);
    }

    private updateNarrowersSetting() {
        let narrowerPropsPref: string[] = [];
        this.narrowerProps.forEach((prop: ARTURIResource) => narrowerPropsPref.push(prop.getURI()));
        let prefValue: string;
        if (narrowerPropsPref.length > 0) {
            prefValue = narrowerPropsPref.join(",");
        }
        this.updateGroupSetting(Properties.pref_concept_tree_narrower_props, prefValue);
    }

    /**
     * OWNED SCHEMES PROPRETIES
     */

    private addScheme() {
        this.prepareProjectAccess();
        this.browsingModals.browseSchemeList("Select a scheme").then(
            (scheme: ARTURIResource) => {
                this.revokeProjectAccess();
                if (!ResourceUtils.containsNode(this.ownedSchemes, scheme)) {
                    this.ownedSchemes.push(scheme);
                    this.groupsService.addOwnedSchemeToGroup(this.project.getName(), this.selectedGroup.iri, scheme).subscribe();
                }
            },
            () => {}
        );
    }

    private removeScheme() {
        this.ownedSchemes.splice(this.ownedSchemes.indexOf(this.selectedScheme), 1);
        this.groupsService.removeOwnedSchemeFromGroup(this.project.getName(), this.selectedGroup.iri, this.selectedScheme).subscribe();
        this.selectedScheme = null;
    }


    //--------------------------------------

    private updateGroupSetting(property: string, value: string, pluginID?: string) {
        this.prefService.setPGSetting(property, this.selectedGroup.iri, value, this.project, pluginID).subscribe();
    }



    private prepareProjectAccess() {
        HttpServiceContext.setContextProject(this.project); //set temp project
        HttpServiceContext.setConsumerProject(new Project("SYSTEM")); //set temp project
    }

    private revokeProjectAccess() {
        HttpServiceContext.removeContextProject();
        HttpServiceContext.removeConsumerProject();
    }
}