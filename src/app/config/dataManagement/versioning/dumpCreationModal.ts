import { Component, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsServices } from "src/app/services/settingsServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ConfigurableExtensionFactory, ExtensionPointID, PluginSpecification, Scope, Settings } from "../../../models/Plugins";
import { BackendTypesEnum, RemoteRepositoryAccessConfig, Repository, RepositoryAccess, RepositoryAccessType } from "../../../models/Project";
import { SettingsEnum } from "../../../models/Properties";
import { ExtensionsServices } from "../../../services/extensionsServices";
import { ExtensionConfiguratorComponent } from "../../../widget/extensionConfigurator/extensionConfiguratorComponent";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "dump-creation-modal",
    templateUrl: "./dumpCreationModal.html",
})
export class DumpCreationModal {
    @Input() title: string;

    @ViewChild("repoConfigurator", { static: false }) repoConfigurator: ExtensionConfiguratorComponent;

    versionId: string;

    repositoryAccessList: RepositoryAccessType[] = [
        RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote, RepositoryAccessType.AccessExistingRemote
    ];
    selectedRepositoryAccess: RepositoryAccessType = this.repositoryAccessList[0];

    //configuration of remote access (used only in case selectedRepositoryAccess is one of CreateRemote or AccessExistingRemote)
    private remoteRepoConfigs: RemoteRepositoryAccessConfig[] = [];
    private selectedRemoteRepoConfig: RemoteRepositoryAccessConfig;

    //core repository containing data
    private repositoryId: string;
    private repoExtensions: ConfigurableExtensionFactory[];
    private selectedRepoExtension: ConfigurableExtensionFactory;
    private selectedRepoConfig: Settings;

    private DEFAULT_REPO_EXTENSION_ID = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.PredefinedRepositoryImplConfigurer";
    private DEFAULT_REPO_CONFIG_TYPE = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.RDF4JNativeSailConfigurerConfiguration";

    //backend types
    private backendTypes: BackendTypesEnum[] = [BackendTypesEnum.openrdf_NativeStore, BackendTypesEnum.openrdf_MemoryStore, BackendTypesEnum.graphdb_FreeSail];
    private selectedRepoBackendType: BackendTypesEnum = this.backendTypes[0];

    constructor(public activeModal: NgbActiveModal, private extensionService: ExtensionsServices, private settingsService: SettingsServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
    }

    ngOnInit() {
        this.extensionService.getExtensions(ExtensionPointID.REPO_IMPL_CONFIGURER_ID).subscribe(
            extensions => {
                this.repoExtensions = <ConfigurableExtensionFactory[]>extensions;
                setTimeout(() => { //let the dataRepoConfigurator component to be initialized (due to *ngIf="dataRepoExtensions")
                    this.repoConfigurator.selectExtensionAndConfiguration(this.DEFAULT_REPO_EXTENSION_ID, this.DEFAULT_REPO_CONFIG_TYPE);
                });
            }
        );

        //init available remote repo access configurations
        this.initRemoteRepoAccessConfigurations();
    }

    private initRemoteRepoAccessConfigurations() {
        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM).subscribe(
            settings => {
                let remoteConfSetting = settings.getPropertyValue(SettingsEnum.remoteConfigs, []);
                if (remoteConfSetting != null) {
                    this.remoteRepoConfigs = remoteConfSetting;
                    //initialize the selected configuration
                    if (this.selectedRemoteRepoConfig != null) {
                        //if previously a config was already selected, select it again (deselected if not found, probably it has been deleted)
                        this.selectedRemoteRepoConfig = this.remoteRepoConfigs.find(c => c.serverURL == this.selectedRemoteRepoConfig.serverURL);
                    } else {
                        if (this.remoteRepoConfigs.length == 1) { //in case of just one configuration, select it
                            this.selectedRemoteRepoConfig = this.remoteRepoConfigs[0];
                        }
                    }
                } else { 
                    //the remote config are refreshed when admin changes it, so it might happend that he deleted the previously available configs 
                    this.remoteRepoConfigs = [];
                    this.selectedRemoteRepoConfig = null;
                }
            }
        );
    }

    /**
     * Tells if the selected RepositoryAccess is remote.
     */
    isSelectedRepoAccessRemote(): boolean {
        return (this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote ||
            this.selectedRepositoryAccess == RepositoryAccessType.AccessExistingRemote);
    }

    /**
     * Tells if the selected RepositoryAccess is in create mode.
     */
    isSelectedRepoAccessCreateMode(): boolean {
        return (this.selectedRepositoryAccess == RepositoryAccessType.CreateLocal ||
            this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote);
    }

    /**
     * Configure the selected repository access in case it is remote.
     */
    configureRemoteRepositoryAccess() {
        this.sharedModals.configureRemoteRepositoryAccess().then(
            () => {
                this.initRemoteRepoAccessConfigurations();
            }
        );
    }

    changeRemoteRepository() {
        if (this.selectedRemoteRepoConfig == null) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.REMOTE_REPO_ACCESS_CONFIG_NOT_SELECTED"}, ModalType.warning);
            return;
        }

        this.sharedModals.selectRemoteRepository({key:"ACTIONS.SELECT_REMOTE_REPO"}, this.selectedRemoteRepoConfig).then(
            (repo: any) => {
                this.repositoryId = (<Repository>repo).id;
            },
            () => { }
        );
    }

    ok() {
        //check if all the data is ok
        //valid version id
        if (this.versionId == null || this.versionId.trim() == "") {
            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_VERSION_ID"}, ModalType.warning);
            return;
        }
        //valid repository access configuration (in case of repository access remote)
        if (this.isSelectedRepoAccessRemote()) {
            if (this.selectedRemoteRepoConfig == null) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.REMOTE_REPO_ACCESS_CONFIG_NOT_SELECTED"}, ModalType.warning);
                return;
            }
        }
        //valid repo id (in case of remote repo accessing mode)
        if (!this.isSelectedRepoAccessCreateMode()) {
            if (this.repositoryId == null || this.repositoryId.trim() == "") {
                this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_REPO_ID"}, ModalType.warning);
                return;
            }
        }
        //valid repo configuration (in case of repo creation mode)
        if (this.isSelectedRepoAccessCreateMode()) {
            //check if repository configuration needs to be configured
            if (this.selectedRepoConfig.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_REQUIRED_PARAM_IN_REPO_ACCESS_CONFIG"}, ModalType.warning);
                return;
            }
        }


        var repositoryAccess: RepositoryAccess = new RepositoryAccess(this.selectedRepositoryAccess);
        //if the selected repo access is remote, add the configuration 
        if (this.isSelectedRepoAccessRemote()) {
            repositoryAccess.setConfiguration(this.selectedRemoteRepoConfig);
        }

        var returnedData: { versionId: string, repositoryAccess: RepositoryAccess, 
                repositoryId: string, repoConfigurerSpecification: PluginSpecification, backendType: BackendTypesEnum} = {
            versionId: this.versionId,
            repositoryAccess: repositoryAccess,
            repositoryId: null,
            repoConfigurerSpecification: null,
            backendType: null
        }
        //specify repository id only if it's in access mode (access existing remote)
        if (!this.isSelectedRepoAccessCreateMode()) {
            returnedData.repositoryId = this.repositoryId;
            returnedData.backendType = this.selectedRepoBackendType;
        } else { //prepare config of repo only if it is in creation mode
            var repoConfigPluginSpecification: PluginSpecification;
            repoConfigPluginSpecification = {
                factoryId: this.selectedRepoExtension.id,
                configType: this.selectedRepoConfig.type,
                configuration: this.selectedRepoConfig.getPropertiesAsMap()
            }
            returnedData.repoConfigurerSpecification = repoConfigPluginSpecification;
        }
        this.activeModal.close(returnedData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}