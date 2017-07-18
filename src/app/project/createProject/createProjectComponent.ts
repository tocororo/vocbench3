import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ProjectServices } from "../../services/projectServices";
import { OntoManagerServices } from "../../services/ontoManagerServices";
import { PluginsServices } from "../../services/pluginsServices";
import { RepositoryAccess, RepositoryAccessType, RemoteRepositoryAccessConfig, Repository } from "../../models/Project";
import { Plugin, PluginConfiguration, PluginConfigParam, PluginSpecification } from "../../models/Plugins";
import { ARTURIResource } from "../../models/ARTResources";
import { RDFS, OWL, SKOS, SKOSXL, DCT } from "../../models/Vocabulary";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "create-project-component",
    templateUrl: "./createProjectComponent.html",
    host: { class: "pageComponent" }
})
export class CreateProjectComponent {

    /**
     * BASIC PROJECT SETTINGS
     */
    private projectName: string;

    private baseUriPrefixList: string[] = ["http://", "https://"];
    private baseUriPrefix: string = this.baseUriPrefixList[0];
    private baseUriSuffix: string;;

    private ontoModelList = [
        { value: new ARTURIResource(OWL.uri), label: "OWL" },
        { value: new ARTURIResource(SKOS.uri), label: "SKOS" },
    ];
    private ontoModelType: ARTURIResource = this.ontoModelList[0].value;

    private lexicalModelList = [
        { value: new ARTURIResource(RDFS.uri), label: "RDFS" },
        { value: new ARTURIResource(SKOS.uri), label: "SKOS" },
        { value: new ARTURIResource(SKOSXL.uri), label: "SKOSXL" }
    ];
    private lexicalModelType: ARTURIResource = this.lexicalModelList[0].value;
    
    private history: boolean = false;
    private validation: boolean = false;

    private repositoryAccessList: RepositoryAccessType[] = [
        RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote, RepositoryAccessType.AccessExistingRemote
    ]
    private selectedRepositoryAccess: RepositoryAccessType = this.repositoryAccessList[0];

    //configuration of remote access (used only in case selectedRepositoryAccess is one of CreateRemote or AccessExistingRemote)
    private remoteAccessConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };

    private repositoryImplConfigurerPluginID = "it.uniroma2.art.semanticturkey.plugin.extpts.RepositoryImplConfigurer";
    private DEFAULT_REPO_CONFIGURER = "it.uniroma2.art.semanticturkey.plugin.impls.repositoryimplconfigurer.conf.RDF4JNativeSailConfigurerConfiguration";
    //core repository containing data
    private dataRepoId: string;
    private dataRepoConfList: {factoryID: string, configuration: PluginConfiguration}[]; 
    private selectedDataRepoConf: {factoryID: string, configuration: PluginConfiguration}; //chosen configuration for data repository
    //support repository for history and validation
    private supportRepoId: string;
    private supportRepoConfList: {factoryID: string, configuration: PluginConfiguration}[];
    private selectedSupportRepoConf: {factoryID: string, configuration: PluginConfiguration}; //chosen configuration for history/validation repository

    /**
     * OPTIONAL PROJECT SETTINGS
     */

    private extPointPanelOpen: boolean = false;

    //URI GENERATOR PLUGIN
    private uriGenUseDefaultSetting: boolean = true;
    private uriGeneratorPluginID = "it.uniroma2.art.semanticturkey.plugin.extpts.URIGenerator";
    private uriGenPluginList: Plugin[]; //available plugins for uri generator (retrieved through getAvailablePlugins)
    private selectedUriGenPlugin: Plugin; //chosen plugin for uri generator (the one selected through a <select> element)
    private uriGenPluginConfMap: Map<string, PluginConfiguration[]> = new Map(); //map of <factoryID, pluginConf> used to store the configurations for the plugins
    private selectedUriGenPluginConfList: PluginConfiguration[]; //plugin configurations for the selected plugin (represent the choices of the <select> element of configurations)
    private selectedUriGenPluginConf: PluginConfiguration; //chosen configuration for the chosen uri generator plugin (selected through a <select> element)

    //RENDERING GENERATOR PLUGIN
    private rendEngUseDefaultSetting: boolean = true;
    private renderingEnginePluginID = "it.uniroma2.art.semanticturkey.plugin.extpts.RenderingEngine";
    private rendEngPluginList: Plugin[]; //available plugins for rendering engine
    private selectedRendEngPlugin: Plugin; //chosen plugin for rendering engine
    private rendEngPluginConfMap: Map<string, PluginConfiguration[]> = new Map(); //map of <factoryID, pluginConf> (plugin - available configs)
    private selectedRendEngPluginConfList: PluginConfiguration[]; //plugin configurations for the selected plugin
    private selectedRendEngPluginConf: PluginConfiguration; //chosen configuration for the chosen rendering engine plugin

    private useProjMetadataProp: boolean = true;
    private creationDatePropList: ARTURIResource[] = [DCT.created];
    private creationDateProp: ARTURIResource = this.creationDatePropList[0];
    private modificationDatePropList: ARTURIResource[] = [DCT.modified];
    private modificationDateProp: ARTURIResource = this.modificationDatePropList[0];

    constructor(private projectService: ProjectServices, private ontMgrService: OntoManagerServices, private pluginService: PluginsServices,
        private router: Router, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
    }

    ngOnInit() {
        //init sail repository plugin
        this.pluginService.getAvailablePlugins(this.repositoryImplConfigurerPluginID).subscribe(
            (plugins: Plugin[]) => {
                for (var i = 0; i < plugins.length; i++) {
                    this.pluginService.getPluginConfigurations(plugins[i].factoryID).subscribe(
                        (configs: {factoryID: string, configurations: PluginConfiguration[]}) => {
                            this.dataRepoConfList = [];
                            this.supportRepoConfList = [];
                            //clone the configurations, so changes on data repo configuration don't affect support repo configuration
                            for (var i = 0; i < configs.configurations.length; i++) {
                                this.dataRepoConfList.push({factoryID: configs.factoryID, configuration: configs.configurations[i].clone()});
                                this.supportRepoConfList.push({factoryID: configs.factoryID, configuration: configs.configurations[i].clone()});
                            }
                            this.selectedDataRepoConf = this.dataRepoConfList[0];
                            for (var i = 0; i < this.dataRepoConfList.length; i++) {
                                if (this.dataRepoConfList[i].configuration.type == this.DEFAULT_REPO_CONFIGURER) {
                                    this.selectedDataRepoConf = this.dataRepoConfList[i];
                                    break;
                                }
                            }
                            this.selectedSupportRepoConf = this.supportRepoConfList[0];
                            for (var i = 0; i < this.supportRepoConfList.length; i++) {
                                if (this.supportRepoConfList[i].configuration.type == this.DEFAULT_REPO_CONFIGURER) {
                                    this.selectedSupportRepoConf = this.supportRepoConfList[i];
                                    break;
                                }
                            }
                        }
                    );
                }
            }
        );

        //init uri generator plugin
        this.pluginService.getAvailablePlugins(this.uriGeneratorPluginID).subscribe(
            (plugins: Plugin[]) => {
                this.uriGenPluginList = plugins;
                this.selectedUriGenPlugin = this.uriGenPluginList[0];
                this.onUriGenPluginChanged(); //init configuration for the default selected uri generator plugin
            }
        );

        //init rendering engine plugin
        this.pluginService.getAvailablePlugins(this.renderingEnginePluginID).subscribe(
            (plugins: Plugin[]) => {
                this.rendEngPluginList = plugins;
                this.selectedRendEngPlugin = this.rendEngPluginList[0];
                this.onRendEnginePluginChanged(); //init configuration for the default selected rendering engine plugin
            }
        );

    }

    /**
     * If the user is creation a project (not accessing an existing one),
     * the data and history-validation repositories IDs are determined from project's name
     */
    private onProjectNameChange() {
        if (this.isSelectedRepoAccessCreateMode()) {
            this.dataRepoId = this.projectName.trim().replace(new RegExp(" ", 'g'), "_") + "_core";
            this.supportRepoId = this.projectName.trim().replace(new RegExp(" ", 'g'), "_") + "_support";
        }
    }

    /**
     * When user paste a uri update baseUriPrefix and baseUriSuffix
     * @param event
     */
    private onBaseUriPaste(event: ClipboardEvent) {
        var pastedText = event.clipboardData.getData("text/plain");
        for (var i = 0; i < this.baseUriPrefixList.length; i++) {
            let pref = this.baseUriPrefixList[i];
            if (pastedText.startsWith(pref)) {
                this.baseUriPrefix = pref;
                this.baseUriSuffix = pastedText.substring(this.baseUriPrefix.length);
                event.preventDefault();
                break;
            }
        }
    }

    /**
     * DATA STORE MANAGEMENT (REPOSITORY ACCESS)
     */

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
            () => {}
        );
    }

    private configureDataRepo() {
        this.sharedModals.configurePlugin(this.selectedDataRepoConf.configuration).then(
            (config: any) => {
                this.selectedDataRepoConf.configuration.params = (<PluginConfiguration>config).params;
            },
            () => {}
        );
    }

    private changeRemoteRepository(repoType: "data" | "support") {
        if (this.remoteAccessConfig.serverURL == null || this.remoteAccessConfig.serverURL.trim() == "") {
            this.basicModals.alert("Missing configuration", "The remote repository has not been configure ('Remote Access Config')."
                + " Please, enter at least the server url, then retry.", "error");
            return;
        }

        var title: string = repoType == "data" ? "Select Remote Data Repository" : "Select Remote History/Validation Repository";
        this.sharedModals.selectRemoteRepository(title, this.remoteAccessConfig).then(
            (repo: any) => {
                if (repoType == "data") {
                    this.dataRepoId = (<Repository>repo).id;
                } else {
                    this.supportRepoId = (<Repository>repo).id;
                }
            }
        );
    }

    private configureSupportRepo() {
        this.sharedModals.configurePlugin(this.selectedSupportRepoConf.configuration).then(
            (config: any) => {
                this.selectedSupportRepoConf.configuration.params = (<PluginConfiguration>config).params;
            },
            () => {}
        );
    }

    /**
     * URI GENERATOR PLUGIN
     */

    private onUriGenPluginChanged() {
        //check if the selected plugin configuration has already the configuration list
        var uriGenConfs: PluginConfiguration[] = this.uriGenPluginConfMap.get(this.selectedUriGenPlugin.factoryID);
        if (uriGenConfs != null) {
            this.selectedUriGenPluginConfList = uriGenConfs;
            this.selectedUriGenPluginConf = this.selectedUriGenPluginConfList[0];
            return; //selected plugin is already in uriGenPluginConfMap, so there's no need to get the configurations
        }
        //configurations for selected plugin doesn't found => get the configurations
        this.pluginService.getPluginConfigurations(this.selectedUriGenPlugin.factoryID).subscribe(
            configs => {
                this.uriGenPluginConfMap.set(configs.factoryID, configs.configurations);
                this.selectedUriGenPluginConfList = configs.configurations;
                //set the first configuration as default
                this.selectedUriGenPluginConf = this.selectedUriGenPluginConfList[0];
            }
        )
    }

    private configureUriGenConf() {
        this.sharedModals.configurePlugin(this.selectedUriGenPluginConf).then(
            (config: any) => {
                this.selectedUriGenPluginConf.params = (<PluginConfiguration>config).params;
            },
            () => {}
        )
    }

    /**
     * RENDERING ENGINE PLUGIN
     */

    private onRendEnginePluginChanged() {
        //check if the selected plugin configuration has already the configuration list
        var rendEngConfs: PluginConfiguration[] = this.rendEngPluginConfMap.get(this.selectedRendEngPlugin.factoryID);
        if (rendEngConfs != null) {
            this.selectedRendEngPluginConfList = rendEngConfs;
            this.selectedRendEngPluginConf = this.selectedRendEngPluginConfList[0];
            return; //selected plugin is already in rendEngPluginConfMap, so there's no need to get the configurations
        }
        //configurations for selected plugin doesn't found => get the configurations
        this.pluginService.getPluginConfigurations(this.selectedRendEngPlugin.factoryID).subscribe(
            configs => {
                this.rendEngPluginConfMap.set(configs.factoryID, configs.configurations);
                this.selectedRendEngPluginConfList = configs.configurations;
                //set the first configuration as default
                this.selectedRendEngPluginConf = this.selectedRendEngPluginConfList[0];
            }
        )
    }

    private configureRendEngConf() {
        this.sharedModals.configurePlugin(this.selectedRendEngPluginConf).then(
            (config: any) => {
                this.selectedRendEngPluginConf.params = (<PluginConfiguration>config).params;
            },
            () => {}
        )
    }

    private createtNew() {

        //check project name
        if (!this.projectName || this.projectName.trim() == "") {
            this.basicModals.alert("Create project", "Project name is missing or not valid", "warning");
            return;
        }
        //check baseURI
        if (!this.baseUriSuffix || this.baseUriSuffix.trim() == "") {
            this.basicModals.alert("Create project", "BaseURI is missing or not valid", "warning");
            return;
        }

        /**
         * Prepare repositoryAccess parameter
         */
        var repositoryAccess: RepositoryAccess = new RepositoryAccess(this.selectedRepositoryAccess);
        //if the selected repo access is remote, add the configuration 
        if (this.isSelectedRepoAccessRemote()) {
            //check if configuration is set
            if ((!this.remoteAccessConfig.serverURL || this.remoteAccessConfig.serverURL.trim() == "")) {
                this.basicModals.alert("Create project",
                    "Remote repository access/creation requires a configuration. Please check serverURL, username and password in 'Remote Access Config'.", "warning");
                return;
            }
            repositoryAccess.setConfiguration(this.remoteAccessConfig);
        }

        /**
         * Prepare coreRepoSailConfigurerSpecification parameter
         */
        var coreRepoSailConfigurerSpecification: PluginSpecification
        //prepare config of core repo only if it is in creation mode
        if (this.isSelectedRepoAccessCreateMode()) { 
            //check if data repository configuration need to be configured
            var coreRepoConfigParams: PluginConfigParam[] = this.selectedDataRepoConf.configuration.params;
            if (this.selectedDataRepoConf.configuration.editRequired) {
                //...and in case if every required configuration parameters are not null
                for (var i = 0; i < coreRepoConfigParams.length; i++) {
                    if (coreRepoConfigParams[i].required && coreRepoConfigParams[i].value != null) {
                        this.basicModals.alert("Create project",
                            "Data Repository (" + this.selectedDataRepoConf.configuration.shortName + ") requires to be configured", "warning");
                        return;
                    }
                }
            }

            var coreRepoProps: any = {};
            for (var i = 0; i < coreRepoConfigParams.length; i++) {
                coreRepoProps[coreRepoConfigParams[i].name] = coreRepoConfigParams[i].value;
            }
            coreRepoSailConfigurerSpecification = {
                factoryId: this.selectedDataRepoConf.factoryID,
                configType: this.selectedDataRepoConf.configuration.type,
                properties: coreRepoProps
            }
        }

        /**
         * Prepare supportRepoSailConfigurerSpecification parameter
         */
        var supportRepoSailConfigurerSpecification: PluginSpecification
        //prepare config of core repo only if it is in creation mode and one of history and validation is enabled
        if ((this.validation || this.history) && this.isSelectedRepoAccessCreateMode()) {
            //check if support repository configuration need to be configured
            var supportRepoConfigParams: PluginConfigParam[] = this.selectedSupportRepoConf.configuration.params;
            if (this.selectedSupportRepoConf.configuration.editRequired) {
                //...and in case if every required configuration parameters are not null
                for (var i = 0; i < supportRepoConfigParams.length; i++) {
                    if (supportRepoConfigParams[i].required && supportRepoConfigParams[i].value != null) {
                        this.basicModals.alert("Create project",
                            "History/Validation Repository (" + this.selectedSupportRepoConf.configuration.shortName + ") requires to be configured", "warning");
                        return;
                    }
                }
            }
            
            var supportRepoProps: any = {};
            for (var i = 0; i < supportRepoConfigParams.length; i++) {
                supportRepoProps[supportRepoConfigParams[i].name] = supportRepoConfigParams[i].value;
            }
            supportRepoSailConfigurerSpecification = {
                factoryId: this.selectedSupportRepoConf.factoryID,
                configType: this.selectedSupportRepoConf.configuration.type,
                properties: supportRepoProps
            }
            // console.log("supportRepoSailConfigurerSpecification", supportRepoSailConfigurerSpecification);
        }
        
        /**
         * Prepare uriGeneratorSpecification parameter
         */
        var uriGeneratorSpecification: PluginSpecification;
        if (!this.uriGenUseDefaultSetting) {
            //check if uriGenerator plugin need to be configured
            if (this.selectedUriGenPluginConf.editRequired) {
                //...and in case if every required configuration parameters are not null
                for (var i = 0; i < this.selectedUriGenPluginConf.params.length; i++) {
                    if (this.selectedUriGenPluginConf.params[i].required && this.selectedUriGenPluginConf.params[i].value != null) {
                        this.basicModals.alert("Create project",
                            "UriGenerator Plugin (" + this.selectedUriGenPluginConf.shortName + ") requires configuration", "warning");
                        return;
                    }
                }
            }

            var uriGenPluginProps: any = {};
            for (var i = 0; i < this.selectedUriGenPluginConf.params.length; i++) {
                uriGenPluginProps[this.selectedUriGenPluginConf.params[i].name] = this.selectedUriGenPluginConf.params[i].value;
            }
            
            uriGeneratorSpecification = {
                factoryId: this.selectedUriGenPlugin.factoryID,
                configType: this.selectedUriGenPluginConf.type,
                properties: uriGenPluginProps
            }
            // console.log("uriGeneratorSpecification", uriGeneratorSpecification);
        }

        /**
         * Prepare renderingEngineSpecification parameter
         */
        var renderingEngineSpecification: PluginSpecification;
        if (!this.rendEngUseDefaultSetting) {
            //check if uriGenerator plugin need to be configured
            if (this.selectedRendEngPluginConf.editRequired) {
                //...and in case if every required configuration parameters are not null
                for (var i = 0; i < this.selectedRendEngPluginConf.params.length; i++) {
                    if (this.selectedRendEngPluginConf.params[i].required && this.selectedRendEngPluginConf.params[i].value != null) {
                        this.basicModals.alert("Create project",
                            "Rendering Engine Plugin (" + this.selectedRendEngPluginConf.shortName + ") requires configuration", "warning");
                        return;
                    }
                }
            }

            var rendEngPluginProps: any = {};
            for (var i = 0; i < this.selectedRendEngPluginConf.params.length; i++) {
                rendEngPluginProps[this.selectedRendEngPluginConf.params[i].name] = this.selectedRendEngPluginConf.params[i].value;
            }

            var renderingEngineSpecification: PluginSpecification = {
                factoryId: this.selectedRendEngPlugin.factoryID,
                configType: this.selectedRendEngPluginConf.type,
                properties: rendEngPluginProps
            }
            // console.log("renderingEngineSpecification", renderingEngineSpecification);
        }

        /**
         * Prepare creationDateProperty and modificationDateProperty
         */
        var creationProp: ARTURIResource;
        var modificationProp: ARTURIResource;
        if (this.useProjMetadataProp) {
            creationProp = this.creationDateProp;
            modificationProp = this.modificationDateProp;
        }

        /**
         * Execute request
         */
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.createProject(this.projectName, this.baseUriPrefix + this.baseUriSuffix,
            this.ontoModelType, this.lexicalModelType, this.history, this.validation,
            repositoryAccess, this.dataRepoId, this.supportRepoId,
            coreRepoSailConfigurerSpecification, supportRepoSailConfigurerSpecification,
            uriGeneratorSpecification, renderingEngineSpecification,
            creationProp, modificationProp).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert("Create project", "Project created successfully").then(
                    () => this.router.navigate(['/Projects'])
                );
            }
        );
    }

}
