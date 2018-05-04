import { Component, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurableExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from "../../../models/Plugins";
import { BackendTypesEnum, RemoteRepositoryAccessConfig, Repository, RepositoryAccess, RepositoryAccessType } from "../../../models/Project";
import { ExtensionsServices } from "../../../services/extensionsServices";
import { PluginsServices } from "../../../services/pluginsServices";
import { ExtensionConfiguratorComponent } from "../../../widget/extensionConfigurator/extensionConfiguratorComponent";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";

export class DumpCreationModalData extends BSModalContext {
    /**
     * @param configuration 
     */
    constructor(public title: string) {
        super();
    }
}

@Component({
    selector: "dump-creation-modal",
    templateUrl: "./dumpCreationModal.html",
})
export class DumpCreationModal implements ModalComponent<DumpCreationModalData> {
    context: DumpCreationModalData;

    @ViewChild("repoConfigurator") repoConfigurator: ExtensionConfiguratorComponent;

    private versionId: string;

    private repositoryAccessList: RepositoryAccessType[] = [
        RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote, RepositoryAccessType.AccessExistingRemote
    ];
    private selectedRepositoryAccess: RepositoryAccessType = this.repositoryAccessList[0];

    private remoteAccessConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };

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

    constructor(public dialog: DialogRef<DumpCreationModalData>, private pluginService: PluginsServices,
        private extensionService: ExtensionsServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
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
    }

    /**
     * Tells if the selected RepositoryAccess is remote.
     */
    private isSelectedRepoAccessRemote(): boolean {
        return (this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote ||
            this.selectedRepositoryAccess == RepositoryAccessType.AccessExistingRemote);
    }

    /**
     * Tells if the selected RepositoryAccess is in create mode.
     */
    private isSelectedRepoAccessCreateMode(): boolean {
        return (this.selectedRepositoryAccess == RepositoryAccessType.CreateLocal ||
            this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote);
    }

    /**
     * Configure the selected repository access in case it is remote.
     */
    private configureRemoteRepositoryAccess() {
        this.sharedModals.configureRemoteRepositoryAccess(this.remoteAccessConfig).then(
            (config: any) => {
                this.remoteAccessConfig = config;
            },
            () => { }
        );
    }

    private changeRemoteRepository() {
        if (this.remoteAccessConfig.serverURL == null || this.remoteAccessConfig.serverURL.trim() == "") {
            this.basicModals.alert("Missing configuration", "The remote repository has not been configure ('Remote Access Config')."
                + " Please, enter at least the server url, then retry.", "error");
            return;
        }

        this.sharedModals.selectRemoteRepository("Select remote repository", this.remoteAccessConfig).then(
            (repo: any) => {
                this.repositoryId = (<Repository>repo).id;
            },
            () => { }
        );
    }

    ok(event: Event) {
        //check if all the data is ok
        //valid version id
        if (this.versionId == null || this.versionId.trim() == "") {
            this.basicModals.alert("Invalid data", "Enter a valid version ID", "error");
            return;
        }
        //valid repository access configuration (in case of repository access remote)
        if (this.isSelectedRepoAccessRemote()) {
            if ((!this.remoteAccessConfig.serverURL || this.remoteAccessConfig.serverURL.trim() == "")) {
                this.basicModals.alert("Missing configuration", "Remote repository access/creation requires a configuration. " + 
                    "Please check serverURL, username and password in 'Remote Access Config'.", "error");
                return;
            }
        }
        //valid repo id (in case of remote repo accessing mode)
        if (!this.isSelectedRepoAccessCreateMode()) {
            if (this.repositoryId == null || this.repositoryId.trim() == "") {
                this.basicModals.alert("Invalid data", "Enter a valid repository ID", "error");
                return;
            }
        }
        //valid repo configuration (in case of repo creation mode)
        if (this.isSelectedRepoAccessCreateMode()) {
            //check if repository configuration needs to be configured
            if (this.selectedRepoConfig.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert("Missing configuration", "Required parameter(s) missing in repository configuration (" +
                    this.selectedRepoConfig.shortName + ")", "warning");
                return;
            }
        }


        var repositoryAccess: RepositoryAccess = new RepositoryAccess(this.selectedRepositoryAccess);
        //if the selected repo access is remote, add the configuration 
        if (this.isSelectedRepoAccessRemote()) {
            repositoryAccess.setConfiguration(this.remoteAccessConfig);
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
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}