import { Component, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, forkJoin, Observable, of } from "rxjs";
import { map, mergeMap, toArray } from "rxjs/operators";
import { ConfigurableExtensionFactory, ExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from "src/app/models/Plugins";
import { ExtensionsServices } from "src/app/services/extensionsServices";
import { ProjectServices } from "src/app/services/projectServices";
import { RepositoriesServices } from "src/app/services/repositoriesServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalType } from "src/app/widget/modal/Modals";
import { Project, RepositorySummary } from '../../models/Project';
import { ExtensionConfiguratorComponent } from "../../widget/extensionConfigurator/extensionConfiguratorComponent";

@Component({
    selector: "proj-settings-editor-modal",
    templateUrl: "./projectSettingsEditorModal.html",
})
export class ProjSettingsEditorModal {
    @Input() project: Project;

    remoteProject: boolean;
    restartRepo: boolean = true;

    //BLACKLISTING
    validationEnabled: boolean;
    blacklisting: boolean;

    //SHACL
    shaclEnabled: boolean;
    shaclValidationEnabled: boolean;

    //UNDO
    changeTrackerSetup: boolean; //required in order to enable/disable undo
    undoEnabled: boolean;

    openAtStartup: boolean;

    //RENDERING ENGINE PLUGIN
    @ViewChild("rendEngConfigurator") rendEngConfigurator: ExtensionConfiguratorComponent;
    rendEngExtensions: ConfigurableExtensionFactory[]; //available extensions for rendering engine (retrieved through getExtensions)
    selectedRendEngExtension: ConfigurableExtensionFactory; //chosen extension for rendering engine (the one selected through a <select> element)
    selectedRendEngExtensionConf: Settings; //chosen configuration for the chosen rendering engine extension (selected through a <select> element)

    //URI GENERATOR
    @ViewChild("uriGenConfigurator") uriGenConfigurator: ExtensionConfiguratorComponent;
    uriGenExtensions: ConfigurableExtensionFactory[]; //available extensions for uri generator (retrieved through getExtensions)
    selectedUriGenExtension: ConfigurableExtensionFactory; //chosen extension for uri generator (the one selected through a <select> element)
    selectedUriGenExtensionConf: Settings; //chosen configuration for the chosen uri generator extension (selected through a <select> element)


    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices, private extensionService: ExtensionsServices,
        private repoService: RepositoriesServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.remoteProject = this.project.getRepositoryLocation().location == "remote";

        this.initBlacklisting();
        //the following initializations envolve back-end requests that need to be performed sequentially in order to prevent project-lock issues
        let asyncInitializationFn: Observable<void>[] = [
            this.initShaclValidation(),
            this.initRenderingEngine(),
            this.initUriGenerator(),
            this.initUndo()
        ];
        concat(...asyncInitializationFn).pipe(
            toArray()
        ).subscribe();

        this.openAtStartup = this.project.getOpenAtStartup();
    }

    //================== BLACKLISTING ==================

    initBlacklisting() {
        this.validationEnabled = this.project.isValidationEnabled();
        if (this.validationEnabled) {
            this.blacklisting = this.project.isBlacklistingEnabled();
        }
    }

    changeBlacklisting() {
        this.blacklisting = !this.blacklisting;
        this.projectService.setBlacklistingEnabled(this.project, this.blacklisting).subscribe(
            () => {
                this.project.setBlacklistingEnabled(this.blacklisting);
                this.checkRepositoryRestart();
            }
        );
    }

    //================== SHACL ==================

    initShaclValidation(): Observable<void> {
        this.shaclEnabled = this.project.isShaclEnabled();
        if (this.shaclEnabled) {
            return this.projectService.isSHACLValidationEnabled(this.project).pipe(
                map(validation => {
                    this.shaclValidationEnabled = validation;
                })
            );
        } else {
            return of(null);
        }
    }

    changeShaclValidation() {
        this.shaclValidationEnabled = !this.shaclValidationEnabled;
        this.projectService.setSHACLValidationEnabled(this.project, this.shaclValidationEnabled).subscribe(
            () => {
                this.checkRepositoryRestart();
            }
        );
    }

    /**
     * When shacl validation or blacklisting changes, it may be necessary to restart the remote repositories.
     */
    private checkRepositoryRestart() {
        if (this.remoteProject && this.restartRepo) {
            this.projectService.getRepositories(this.project).subscribe(
                (repositories: RepositorySummary[]) => {
                    let restartFn: Observable<void>[] = [];
                    repositories.forEach(r => {
                        if (r.backendType == "graphdb:FreeSail" || r.backendType == "owlim:Sail") {
                            restartFn.push(
                                this.repoService.restartRemoteRepository(r.remoteRepoSummary.serverURL, r.remoteRepoSummary.repositoryId, r.remoteRepoSummary.username, r.remoteRepoSummary.password)
                            );
                        }
                    });
                    if (restartFn.length > 0) {
                        forkJoin(restartFn).subscribe();
                    }
                }
            );
        }
    }

    //================== UNDO ==================

    initUndo(): Observable<void> {
        this.undoEnabled = this.project.isUndoEnabled();
        return this.projectService.isChangeTrackerSetUp(this.project).pipe(
            map(changeTrackerSetup => {
                this.changeTrackerSetup = changeTrackerSetup;
            })
        );
    }

    changeUndo() {
        this.undoEnabled = !this.undoEnabled;
        this.projectService.setUndoEnabled(this.project, this.undoEnabled).subscribe(
            () => {
                this.checkRepositoryRestart();
            }
        );
    }

    //================== OPEN AT STARTUP ==================

    onOpenAtStartupChanged() {
        this.projectService.setOpenAtStartup(this.project, this.openAtStartup).subscribe();
        this.project.setOpenAtStartup(this.openAtStartup);
    }

    //================== RENDERING ENGINE ==================

    private initRenderingEngine(): Observable<void> {
        return this.extensionService.getExtensions(ExtensionPointID.RENDERING_ENGINE_ID).pipe(
            mergeMap((extensions: ExtensionFactory[]) => {
                this.rendEngExtensions = <ConfigurableExtensionFactory[]>extensions;
                return this.projectService.getRenderingEngineConfiguration(this.project).pipe(
                    map(config => {
                        return this.rendEngConfigurator.forceConfiguration(config.factoryID, config.settings);
                    })
                );
            })
        );
    }

    updateRenderingEngine() {
        //check if configuration needs to be configured
        if (this.selectedRendEngExtensionConf.requireConfiguration()) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.MISSING_RENDERING_ENGINE_CONFIG" }, ModalType.warning);
            return;
        }
        let pluginSpec: PluginSpecification = {
            factoryId: this.selectedRendEngExtension.id,
            configType: this.selectedRendEngExtensionConf.type,
            configuration: this.selectedRendEngExtensionConf.getPropertiesAsMap()
        };
        this.projectService.updateRenderingEngineConfiguration(this.project, pluginSpec).subscribe(
            () => {
                this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.RENDERING_ENGINE_CONFIG_UPDATED" });
            }
        );
    }

    //================== URI GENERATOR ==================

    private initUriGenerator(): Observable<void> {
        return this.extensionService.getExtensions(ExtensionPointID.URI_GENERATOR_ID).pipe(
            mergeMap((extensions: ExtensionFactory[]) => {
                this.uriGenExtensions = <ConfigurableExtensionFactory[]>extensions;
                return this.projectService.getURIGeneratorConfiguration(this.project).pipe(
                    map(config => {
                        return this.uriGenConfigurator.forceConfiguration(config.factoryID, config.settings);
                    })
                );
            })
        );
    }

    updateUriGenerator() {
        //check if configuration needs to be configured
        if (this.selectedUriGenExtensionConf.requireConfiguration()) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.MISSING_URI_GENERATOR_CONFIG" }, ModalType.warning);
            return;
        }
        let pluginSpec: PluginSpecification = {
            factoryId: this.selectedUriGenExtension.id,
            configType: this.selectedUriGenExtensionConf.type,
            configuration: this.selectedUriGenExtensionConf.getPropertiesAsMap()
        };
        this.projectService.updateURIGeneratorConfiguration(this.project, pluginSpec).subscribe(
            () => {
                this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.URI_GENERATOR_CONFIG_UPDATED" });
            }
        );
    }


    ok() {
        this.activeModal.close();
    }

}