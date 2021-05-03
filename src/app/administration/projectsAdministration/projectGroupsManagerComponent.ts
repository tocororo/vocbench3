import { Component, Input, SimpleChanges } from "@angular/core";
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ExtensionPointID, Scope } from "src/app/models/Plugins";
import { SettingsServices } from "src/app/services/settingsServices";
import { ARTURIResource } from "../../models/ARTResources";
import { Project } from "../../models/Project";
import { ConceptTreePreference, SettingsEnum } from "../../models/Properties";
import { UsersGroup } from "../../models/User";
import { OntoLex, SKOS } from "../../models/Vocabulary";
import { PropertyServices } from "../../services/propertyServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { UsersGroupsServices } from "../../services/usersGroupsServices";
import { HttpServiceContext } from "../../utils/HttpManager";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { ProjectContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "project-groups-manager",
    templateUrl: "./projectGroupsManagerComponent.html",
})
export class ProjectGroupsManagerComponent {

    @Input() project: Project;
    private lastBrowsedProjectCtx: ProjectContext;
    private projectClosed: boolean;

    groups: UsersGroup[]; //list of groups
    selectedGroup: UsersGroup; //group selected in the list of groups

    private concTreePref: ConceptTreePreference;
    private baseBroaderProp: string;
    private broaderProps: ARTURIResource[] = [];
    private narrowerProps: ARTURIResource[] = [];
    private includeSubProps: boolean;
    private syncInverse: boolean;

    private selectedBroader: ARTURIResource;
    private selectedNarrower: ARTURIResource;

    private ownedSchemes: ARTURIResource[] = [];
    private selectedScheme: ARTURIResource;

    translationParam: { projName: string } = { projName: "" };

    constructor(private groupsService: UsersGroupsServices, private settingsService: SettingsServices,
        private resourceService: ResourcesServices, private propService: PropertyServices, 
        private browsingModals: BrowsingModalServices, private vbProp: VBProperties) { }

    ngOnInit() {
        this.groupsService.listGroups().subscribe(
            groups => {
                this.groups = groups;
            }
        )
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            this.translationParam = { projName: this.project.getName() };
            if (this.selectedGroup) {
                this.initSettings();
            }
        }
    }

    isProjectSkosCompliant() {
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
         * array of getResourcesInfo functions collected in the handlers of getSettingsForProjectAdministration (for broader and narrower props)
         * and getProjectGroupBinding (for ownedSchemes) responses.
         */
        let describeFunctions: any[] = [];

        let getPGSettingsFn = this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_GROUP, this.project, null, this.selectedGroup).pipe(
            map(settings => {
                this.broaderProps = [];
                this.narrowerProps = [];
                
                this.concTreePref = settings.getPropertyValue(SettingsEnum.conceptTree);
                
                if (this.concTreePref != null) {
                    this.baseBroaderProp = this.concTreePref.baseBroaderProp;
                    if (this.baseBroaderProp == null) {
                        this.baseBroaderProp = SKOS.broader.getURI();
                    }

                    let broaderPropsPref: string[] = this.concTreePref.broaderProps;
                    if (broaderPropsPref != null) {
                        let broaderPropsTemp: ARTURIResource[] = broaderPropsPref.map(b => new ARTURIResource(b));
                        if (broaderPropsTemp.length > 0) {
                            let describeBroadersFn = this.resourceService.getResourcesInfo(broaderPropsTemp).pipe(
                                map(resources => {
                                    this.broaderProps = <ARTURIResource[]>resources;
                                })
                            );
                            describeFunctions.push(describeBroadersFn);
                        }
                    }

                    let narrowerPropsPref: string[] = this.concTreePref.narrowerProps;
                    if (narrowerPropsPref != null) {
                        let narrowerPropsTemp: ARTURIResource[] = narrowerPropsPref.map(n => new ARTURIResource(n));
                        if (narrowerPropsTemp.length > 0) {
                            let describeNarrowersFn = this.resourceService.getResourcesInfo(narrowerPropsTemp).pipe(
                                map(resources => {
                                    this.narrowerProps = <ARTURIResource[]>resources;
                                })
                            );
                            describeFunctions.push(describeNarrowersFn);
                        }
                    }

                    this.includeSubProps = this.concTreePref.includeSubProps != false; //so that default is true
                    this.syncInverse = this.concTreePref.syncInverse != false; //so that default is true
                } else {
                    this.concTreePref = new ConceptTreePreference();
                }
                
            })
        );

        let getPGBindingFn = this.groupsService.getProjectGroupBinding(this.project.getName(), this.selectedGroup.iri).pipe(
            map(binding => {
                let ownedSchemesTemp: ARTURIResource[] = [];
                if (binding.ownedSchemes != null) {
                    binding.ownedSchemes.forEach((schemeUri: string) => {
                        ownedSchemesTemp.push(new ARTURIResource(schemeUri));
                    });
                }
                this.ownedSchemes = [];
                if (ownedSchemesTemp.length > 0) {
                    let describeOwnedSchemesFn = this.resourceService.getResourcesInfo(ownedSchemesTemp).pipe(
                        map(resources => {
                            this.ownedSchemes = <ARTURIResource[]>resources;
                        })
                    );
                    describeFunctions.push(describeOwnedSchemesFn);
                }
            })
        );

        forkJoin([getPGSettingsFn, getPGBindingFn]).subscribe(
            () => {
                if (describeFunctions.length > 0) {
                    forkJoin(describeFunctions).pipe(
                        finalize(() => () => this.revokeProjectAccess()) //remove the ctx_project
                    ).subscribe();
                } else {
                    this.revokeProjectAccess(); //remove the ctx_project
                }
            }
        );
        
    }

    selectGroup(group: UsersGroup) {
        this.selectedGroup = group;
        if (this.project != null) {
            this.initSettings();
        }
    }


    /**
     * BASE BROADER HANDLERS
     */

    changeBaseBroaderProperty() {
        this.prepareProjectAccess();
        this.prepareProjectBrowse().subscribe(
            () => {
                this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, [SKOS.broader], null, null, this.lastBrowsedProjectCtx).then(
                    (prop: ARTURIResource) => {
                        this.revokeProjectAccess();
                        this.baseBroaderProp = prop.getURI();
                        this.updateGroupSetting();
                    },
                    () => {}
                );
            }
        );
    }

    /**
     * BROADER/NARROWER PROPRETIES
     */

    addBroader() {
        this.prepareProjectAccess();
        this.prepareProjectBrowse().subscribe(
            () => {
                this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, [SKOS.broader], null, null, this.lastBrowsedProjectCtx).then(
                    (prop: ARTURIResource) => {
                        this.revokeProjectAccess();
                        if (!ResourceUtils.containsNode(this.broaderProps, prop)) {
                            this.broaderProps.push(prop);
                            this.updateGroupSetting();
                            //if synchronization is active sync the lists
                            if (this.syncInverse) {
                                this.syncInverseOfBroader().subscribe(
                                    () => {
                                        this.updateGroupSetting();
                                    }
                                )
                            }
                        }
                    },
                    () => {}
                )
            }
        );
    }

    addNarrower() {
        this.prepareProjectAccess();
        this.prepareProjectBrowse().subscribe(
            () => {
                this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, [SKOS.narrower], null, null, this.lastBrowsedProjectCtx).then(
                    (prop: ARTURIResource) => {
                        this.revokeProjectAccess();
                        if (!ResourceUtils.containsNode(this.narrowerProps, prop)) {
                            this.narrowerProps.push(prop);
                            this.updateGroupSetting();
                            //if synchronization is active sync the lists
                            if (this.syncInverse) {
                                this.syncInverseOfNarrower().subscribe(
                                    () => {
                                        this.updateGroupSetting();
                                    }
                                )
                            }
                        }
                    },
                    () => {}
                )
            }
        );
    }

    removeBroader() {
        this.broaderProps.splice(this.broaderProps.indexOf(this.selectedBroader), 1);
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
                        this.updateGroupSetting();
                    }
                }
            );
        } else {
            this.updateGroupSetting();
        }
        this.selectedBroader = null;
    }

    removeNarrower() {
        this.narrowerProps.splice(this.narrowerProps.indexOf(this.selectedNarrower), 1);
        this.updateGroupSetting();
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
                        this.updateGroupSetting();
                    }
                }
            );
        } else {
            this.updateGroupSetting();
        }
        this.selectedNarrower = null;
    }

    onSyncChange() {
        console.log("onSyncChange", this.syncInverse);
        //if sync inverse properties change from false to true perform a sync
        if (this.syncInverse) {
            this.syncInverseOfBroader().subscribe(
                () => {
                    this.syncInverseOfNarrower().subscribe(
                        () => {
                            this.updateGroupSetting();
                        }
                    ); 
                }
            );
        }
    }

    private syncInverseOfBroader(): Observable<any> {
        if (this.broaderProps.length > 0) {
            this.prepareProjectAccess();
            return this.propService.getInverseProperties(this.broaderProps).pipe(
                map((inverseProps: ARTURIResource[]) => {
                    this.revokeProjectAccess();
                    inverseProps.forEach((narrowerProp: ARTURIResource) => {
                        if (!ResourceUtils.containsNode(this.narrowerProps, narrowerProp)) { //invers is not already among the narrowerProps
                            let broaderPropUri: string = narrowerProp.getAdditionalProperty("inverseOf");
                            //add it at the same index of its inverse prop
                            let idx: number = ResourceUtils.indexOfNode(this.broaderProps, new ARTURIResource(broaderPropUri));
                            this.narrowerProps.splice(idx, 0, narrowerProp);
                        }
                    });
                })
            );
        } else {
            return of(null);
        }
    }

    private syncInverseOfNarrower(): Observable<any> {
        if (this.narrowerProps.length > 0) {
            this.prepareProjectAccess();
            return this.propService.getInverseProperties(this.narrowerProps).pipe(
                map((inverseProps: ARTURIResource[]) => {
                    this.revokeProjectAccess();
                    inverseProps.forEach((broaderProp: ARTURIResource) => {
                        if (!ResourceUtils.containsNode(this.broaderProps, broaderProp)) { //invers is not already among the broaderProps
                            let narrowerPropUri: string = broaderProp.getAdditionalProperty("inverseOf");
                            //add it at the same index of its inverse prop
                            let idx: number = ResourceUtils.indexOfNode(this.narrowerProps, new ARTURIResource(narrowerPropUri));
                            this.broaderProps.splice(idx, 0, broaderProp);
                        }
                    });
                })
            );
        } else {
            return of(null);
        }
    }

    onIncludeSubPropsChange() {
        this.updateGroupSetting();
    }


    /**
     * OWNED SCHEMES PROPRETIES
     */

    addScheme() {
        this.prepareProjectAccess();
        this.prepareProjectBrowse().subscribe(
            () => {
                this.browsingModals.browseSchemeList({key:"DATA.ACTIONS.SELECT_SCHEME"}, this.lastBrowsedProjectCtx).then(
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
        );
    }

    removeScheme() {
        this.ownedSchemes.splice(this.ownedSchemes.indexOf(this.selectedScheme), 1);
        this.groupsService.removeOwnedSchemeFromGroup(this.project.getName(), this.selectedGroup.iri, this.selectedScheme).subscribe();
        this.selectedScheme = null;
    }


    //--------------------------------------

    private updateGroupSetting() {
        this.concTreePref.baseBroaderProp = this.baseBroaderProp;
        this.concTreePref.broaderProps = this.broaderProps.map(b => b.toNT());
        this.concTreePref.narrowerProps = this.narrowerProps.map(n => n.toNT());
        this.concTreePref.includeSubProps = this.includeSubProps;
        this.concTreePref.syncInverse = this.syncInverse;
        this.settingsService.storeSettingForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_GROUP, SettingsEnum.conceptTree, this.concTreePref, this.project, null, this.selectedGroup).subscribe();
    }



    private prepareProjectAccess() {
        HttpServiceContext.setContextProject(this.project); //set temp project
        HttpServiceContext.setConsumerProject(new Project("SYSTEM")); //set temp project
    }

    /**
     * Initialize the project context for the project to browse.
     */
    private prepareProjectBrowse(): Observable<any> {
        if (this.lastBrowsedProjectCtx != null && this.lastBrowsedProjectCtx.getProject().getName() == this.project.getName()) {
            //project context was already initialized in a previous browsing => do not initialize it again
            return of(null);
        } else { //project context never initialized or initialized for a different project
            this.lastBrowsedProjectCtx = new ProjectContext(this.project);
            let initProjectCtxFn: Observable<void>[] = [
                this.vbProp.initProjectUserBindings(this.lastBrowsedProjectCtx),
                this.vbProp.initUserProjectPreferences(this.lastBrowsedProjectCtx),
                this.vbProp.initProjectSettings(this.lastBrowsedProjectCtx)
            ];
            return forkJoin(initProjectCtxFn);
        }
    }

    private revokeProjectAccess() {
        HttpServiceContext.removeContextProject();
        HttpServiceContext.removeConsumerProject();
    }
}