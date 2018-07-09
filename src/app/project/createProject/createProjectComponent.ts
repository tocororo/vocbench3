import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ARTURIResource, ResourceUtils } from "../../models/ARTResources";
import { ConfigurableExtensionFactory, ExtensionPointID, Plugin, PluginSpecification, Settings } from "../../models/Plugins";
import { BackendTypesEnum, RemoteRepositoryAccessConfig, Repository, RepositoryAccess, RepositoryAccessType } from "../../models/Project";
import { DCT, OWL, OntoLex, RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";
import { ExtensionsServices } from "../../services/extensionsServices";
import { PluginsServices } from "../../services/pluginsServices";
import { ProjectServices } from "../../services/projectServices";
import { UIUtils } from "../../utils/UIUtils";
import { ExtensionConfiguratorComponent } from "../../widget/extensionConfigurator/extensionConfiguratorComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "create-project-component",
    templateUrl: "./createProjectComponent.html",
    host: { class: "pageComponent" }
})
export class CreateProjectComponent {

    @ViewChild("dataRepoConfigurator") dataRepoConfigurator: ExtensionConfiguratorComponent;
    @ViewChild("supportRepoConfigurator") supportRepoConfigurator: ExtensionConfiguratorComponent;

    /**
     * BASIC PROJECT SETTINGS
     */
    private projectName: string;

    private baseUriPrefixList: string[] = ["http://", "https://"];
    private baseUriPrefix: string = this.baseUriPrefixList[0];
    private baseUriSuffix: string;;

    private ontoModelList = [
        { value: new ARTURIResource(RDFS.uri), label: "RDFS" },
        { value: new ARTURIResource(OWL.uri), label: "OWL" },
        { value: new ARTURIResource(SKOS.uri), label: "SKOS" },
        { value: new ARTURIResource(OntoLex.uri), label: "OntoLex" }
    ];
    private ontoModelType: ARTURIResource = this.ontoModelList[0].value;

    private lexicalModelList = [
        { value: new ARTURIResource(RDFS.uri), label: "RDFS" },
        { value: new ARTURIResource(SKOS.uri), label: "SKOS" },
        { value: new ARTURIResource(SKOSXL.uri), label: "SKOSXL" },
        { value: new ARTURIResource(OntoLex.uri), label: "OntoLex" }
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

    private DEFAULT_REPO_EXTENSION_ID = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.PredefinedRepositoryImplConfigurer";
    private DEFAULT_REPO_CONFIG_TYPE = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.RDF4JNativeSailConfigurerConfiguration";

    //core repository containing data
    private dataRepoId: string;
    private dataRepoExtensions: ConfigurableExtensionFactory[];
    private selectedDataRepoExtension: ConfigurableExtensionFactory;
    private selectedDataRepoConfig: Settings;

    //support repository for history and validation
    private supportRepoId: string;
    private supportRepoExtensions: ConfigurableExtensionFactory[];
    private selectedSupportRepoExtension: ConfigurableExtensionFactory;
    private selectedSupportRepoConfig: Settings;

    //backend types (when accessing an existing remote repository)
    private backendTypes: BackendTypesEnum[] = [BackendTypesEnum.openrdf_NativeStore, BackendTypesEnum.openrdf_MemoryStore, BackendTypesEnum.graphdb_FreeSail];
    private selectedCoreRepoBackendType: BackendTypesEnum = this.backendTypes[0];
    private selectedSupportRepoBackendType: BackendTypesEnum = this.backendTypes[0];

    /**
     * OPTIONAL PROJECT SETTINGS
     */

    private extPointPanelOpen: boolean = false;

    //URI GENERATOR PLUGIN
    private uriGenUseDefaultSetting: boolean = true;
    private uriGenPluginList: Plugin[]; //available plugins for uri generator (retrieved through getAvailablePlugins)
    private selectedUriGenPlugin: Plugin; //chosen plugin for uri generator (the one selected through a <select> element)
    private uriGenPluginConfMap: Map<string, Settings[]> = new Map(); //map of <factoryID, pluginConf> used to store the configurations for the plugins
    private selectedUriGenPluginConfList: Settings[]; //plugin configurations for the selected plugin (represent the choices of the <select> element of configurations)
    private selectedUriGenPluginConf: Settings; //chosen configuration for the chosen uri generator plugin (selected through a <select> element)

    //RENDERING GENERATOR PLUGIN
    private rendEngUseDefaultSetting: boolean = true;
    private rendEngPluginList: Plugin[]; //available plugins for rendering engine
    private selectedRendEngPlugin: Plugin; //chosen plugin for rendering engine
    private rendEngPluginConfMap: Map<string, Settings[]> = new Map(); //map of <factoryID, pluginConf> (plugin - available configs)
    private selectedRendEngPluginConfList: Settings[]; //plugin configurations for the selected plugin
    private selectedRendEngPluginConf: Settings; //chosen configuration for the chosen rendering engine plugin

    private useProjMetadataProp: boolean = true;
    private createdProp: string = DCT.created.getURI();
    private modifiedProp: string = DCT.modified.getURI();

    constructor(private projectService: ProjectServices, private pluginService: PluginsServices, private extensionService: ExtensionsServices,
        private router: Router, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
    }

    ngOnInit() {
        //init core repo extensions
        this.extensionService.getExtensions(ExtensionPointID.REPO_IMPL_CONFIGURER_ID).subscribe(
            extensions => {
                this.dataRepoExtensions = <ConfigurableExtensionFactory[]>extensions;
                setTimeout(() => { //let the dataRepoConfigurator component to be initialized (due to *ngIf="dataRepoExtensions")
                    this.dataRepoConfigurator.selectExtensionAndConfiguration(this.DEFAULT_REPO_EXTENSION_ID, this.DEFAULT_REPO_CONFIG_TYPE);
                });
            }
        );

        //init support repo extensions
        /**
         * this could be done also exploiting the same previous getExtension,
         * but I preferred to repeat the request in order to avoid to clone the extensions
         */
        this.extensionService.getExtensions(ExtensionPointID.REPO_IMPL_CONFIGURER_ID).subscribe(
            extensions => {
                this.supportRepoExtensions = <ConfigurableExtensionFactory[]>extensions;
                setTimeout(() => { //let the supportRepoConfigurator component to be initialized (due to *ngIf="supportRepoExtensions")
                    this.supportRepoConfigurator.selectExtensionAndConfiguration(this.DEFAULT_REPO_EXTENSION_ID, this.DEFAULT_REPO_CONFIG_TYPE);
                });
            }
        );

        //init uri generator plugin
        this.pluginService.getAvailablePlugins(ExtensionPointID.URI_GENERATOR_ID).subscribe(
            (plugins: Plugin[]) => {
                this.uriGenPluginList = plugins;
                this.selectedUriGenPlugin = this.uriGenPluginList[0];
                this.onUriGenPluginChanged(); //init configuration for the default selected uri generator plugin
            }
        );

        //init rendering engine plugin
        this.pluginService.getAvailablePlugins(ExtensionPointID.RENDERING_ENGINE_ID).subscribe(
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

    private onOntoModelChanged() {
        if (this.ontoModelType.getURI() == OntoLex.uri) {
            this.lexicalModelList.forEach(
                (model) => {
                    if (model.value.getURI() == OntoLex.uri) {
                        this.lexicalModelType =  model.value;
                    }
                }
            );
        }
    }

    /**
     * Useful in the view to "lock" the selection of lexicalization to OntoLex in case the ontoModel is OntoLex
     */
    private isOntoModelOntolex() {
        return this.ontoModelType.getURI() == OntoLex.uri;
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

    /**
     * URI GENERATOR PLUGIN
     */

    private onUriGenPluginChanged() {
        //check if the selected plugin configuration has already the configuration list
        var uriGenConfs: Settings[] = this.uriGenPluginConfMap.get(this.selectedUriGenPlugin.factoryID);
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
                this.selectedUriGenPluginConf.properties = (<Settings>config).properties;
            },
            () => {}
        )
    }

    /**
     * RENDERING ENGINE PLUGIN
     */

    private onRendEnginePluginChanged() {
        //check if the selected plugin configuration has already the configuration list
        var rendEngConfs: Settings[] = this.rendEngPluginConfMap.get(this.selectedRendEngPlugin.factoryID);
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
                this.selectedRendEngPluginConf.properties = (<Settings>config).properties;
            },
            () => {}
        )
    }

    /**
     * CREATED/MODIFIED PROPERTIES
     */

    private updateCreatedProp(propUri: string) {
        if (!ResourceUtils.testIRI(propUri)) {
            this.basicModals.alert("Invalid IRI", "The entered value '" + propUri + "' is not a valid IRI", "warning");
            let backupProp = this.createdProp;
            this.createdProp = null;
            setTimeout(() => {
                this.createdProp = backupProp;
            });
        } else {
            this.createdProp = propUri;
        }
    }

    private updateModifiedProp(propUri: string) {
        if (!ResourceUtils.testIRI(propUri)) {
            this.basicModals.alert("Invalid IRI", "The entered value '" + propUri + "' is not a valid IRI", "warning");
            let backupProp = this.modifiedProp;
            this.modifiedProp = null;
            setTimeout(() => {
                this.modifiedProp = backupProp;
            });
        } else {
            this.modifiedProp = propUri;
        }
    }

    //------------------------------------

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
            //check if data repository configuration needs to be configured
            if (this.selectedDataRepoConfig.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert("Create project", "Data Repository (" + this.selectedDataRepoConfig.shortName 
                    + ") requires to be configured", "warning");
                    return;
            }

            coreRepoSailConfigurerSpecification = {
                factoryId: this.selectedDataRepoExtension.id,
                configType: this.selectedDataRepoConfig.type,
                configuration: this.selectedDataRepoConfig.getPropertiesAsMap()
            }
        }

        /**
         * Prepare supportRepoSailConfigurerSpecification parameter
         */
        var supportRepoSailConfigurerSpecification: PluginSpecification
        //prepare config of core repo only if it is in creation mode and one of history and validation is enabled
        if ((this.validation || this.history) && this.isSelectedRepoAccessCreateMode()) {
            if (this.selectedSupportRepoConfig.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert("Create project", "History/Validation Repository (" + this.selectedSupportRepoConfig.shortName 
                    + ") requires to be configured", "warning");
                    return;
            }

            supportRepoSailConfigurerSpecification = {
                factoryId: this.selectedSupportRepoExtension.id,
                configType: this.selectedSupportRepoConfig.type,
                configuration: this.selectedSupportRepoConfig.getPropertiesAsMap()
            }
        }

        //backend types
        var coreRepoBackendType: BackendTypesEnum;
        var supportRepoBackendType: BackendTypesEnum;
        if (!this.isSelectedRepoAccessCreateMode()) {
            coreRepoBackendType = this.selectedCoreRepoBackendType;
            if (this.validation || this.history) {
                supportRepoBackendType = this.selectedSupportRepoBackendType;
            }
        }
        
        /**
         * Prepare uriGeneratorSpecification parameter
         */
        var uriGeneratorSpecification: PluginSpecification;
        if (!this.uriGenUseDefaultSetting) {
            //check if uriGenerator plugin needs to be configured
            if (this.selectedUriGenPluginConf.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert("Create project", "UriGenerator Plugin (" + this.selectedUriGenPluginConf.shortName 
                    + ") requires configuration", "warning");
                return;
            }
            uriGeneratorSpecification = {
                factoryId: this.selectedUriGenPlugin.factoryID,
                configType: this.selectedUriGenPluginConf.type,
                properties: this.selectedUriGenPluginConf.getPropertiesAsMap()
            }
            // console.log("uriGeneratorSpecification", uriGeneratorSpecification);
        }

        /**
         * Prepare renderingEngineSpecification parameter
         */
        var renderingEngineSpecification: PluginSpecification;
        if (!this.rendEngUseDefaultSetting) {
            //check if uriGenerator plugin needs to be configured
            if (this.selectedRendEngPluginConf.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert("Create project", "Rendering Engine Plugin (" + this.selectedRendEngPluginConf.shortName 
                    + ") requires configuration", "warning");
                return;
            }

            renderingEngineSpecification = {
                factoryId: this.selectedRendEngPlugin.factoryID,
                configType: this.selectedRendEngPluginConf.type,
                properties: this.selectedRendEngPluginConf.getPropertiesAsMap()
            }
            // console.log("renderingEngineSpecification", renderingEngineSpecification);
        }

        /**
         * Prepare creationDateProperty and modificationDateProperty
         */
        var creationProp: ARTURIResource;
        var modificationProp: ARTURIResource;
        if (this.useProjMetadataProp) {
            creationProp = new ARTURIResource(this.createdProp);
            modificationProp = new ARTURIResource(this.modifiedProp);
        }

        /**
         * Execute request
         */
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.createProject(this.projectName, this.baseUriPrefix + this.baseUriSuffix,
            this.ontoModelType, this.lexicalModelType, this.history, this.validation,
            repositoryAccess, this.dataRepoId, this.supportRepoId,
            coreRepoSailConfigurerSpecification, coreRepoBackendType,
            supportRepoSailConfigurerSpecification, supportRepoBackendType,
            uriGeneratorSpecification, renderingEngineSpecification,
            creationProp, modificationProp).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert("Create project", "Project created successfully").then(
                    () => this.router.navigate(['/Projects'])
                );
            },
            (err: Error) => {
                this.projectService.handleMissingChangetrackierSailError(err, this.basicModals);
            }
        );
    }

}
