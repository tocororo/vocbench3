import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { PluginsServices } from "../../../services/pluginsServices";
import { Repository, RemoteRepositoryAccessConfig, RepositoryAccess, RepositoryAccessType, BackendTypesEnum } from "../../../models/Project";
import { Plugin, PluginConfiguration, PluginConfigParam, PluginSpecification, ExtensionPoint } from "../../../models/Plugins";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

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

    private versionId: string;

    private repositoryAccessList: RepositoryAccessType[] = [
        RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote, RepositoryAccessType.AccessExistingRemote
    ];
    private selectedRepositoryAccess: RepositoryAccessType = this.repositoryAccessList[0];

    private remoteAccessConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };

    //core repository containing data
    private repositoryId: string;
    private repoConfList: { factoryID: string, configuration: PluginConfiguration }[];
    private selectedRepoConf: { factoryID: string, configuration: PluginConfiguration }; //chosen configuration for data repository

    //backend types
    private backendTypes: BackendTypesEnum[] = [BackendTypesEnum.openrdf_NativeStore, BackendTypesEnum.openrdf_MemoryStore, BackendTypesEnum.graphdb_FreeSail];
    private selectedRepoBackendType: BackendTypesEnum = this.backendTypes[0];

    constructor(public dialog: DialogRef<DumpCreationModalData>, private pluginService: PluginsServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //init sail repository plugin
        this.pluginService.getAvailablePlugins(ExtensionPoint.REPO_IMPL_CONFIGURER_ID).subscribe(
            (plugins: Plugin[]) => {
                for (var i = 0; i < plugins.length; i++) {
                    this.pluginService.getPluginConfigurations(plugins[i].factoryID).subscribe(
                        (configs: {factoryID: string, configurations: PluginConfiguration[]}) => {
                            this.repoConfList = [];
                            //clone the configurations, so changes on data repo configuration don't affect support repo configuration
                            for (var i = 0; i < configs.configurations.length; i++) {
                                this.repoConfList.push({factoryID: configs.factoryID, configuration: configs.configurations[i].clone()});
                            }
                            this.selectedRepoConf = this.repoConfList[0];
                        }
                    );
                }
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

    private configureRepo() {
        this.sharedModals.configurePlugin(this.selectedRepoConf.configuration).then(
            (config: any) => {
                this.selectedRepoConf.configuration.params = (<PluginConfiguration>config).params;
            },
            () => {}
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
            let repoConfigParams: PluginConfigParam[] = this.selectedRepoConf.configuration.params;
            if (this.selectedRepoConf.configuration.editRequired) {
                //check if every required configuration parameters are not null
                for (var i = 0; i < repoConfigParams.length; i++) {
                    if (repoConfigParams[i].required && repoConfigParams[i].value == null) {
                        this.basicModals.alert("Missing configuration", "Required parameter(s) missing in repository configuration (" +
                            this.selectedRepoConf.configuration.shortName +")", "error");
                        return;
                    }
                }
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
            var repoProps: any = {};
            let repoConfigParams: PluginConfigParam[] = this.selectedRepoConf.configuration.params;
            for (var i = 0; i < repoConfigParams.length; i++) {
                repoProps[repoConfigParams[i].name] = repoConfigParams[i].value;
            }
            repoConfigPluginSpecification = {
                factoryId: this.selectedRepoConf.factoryID,
                configType: this.selectedRepoConf.configuration.type,
                properties: repoProps
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