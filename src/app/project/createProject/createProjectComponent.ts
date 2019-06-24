import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { DatasetCatalogModalReturnData } from "../../config/dataManagement/datasetCatalog/datasetCatalogModal";
import { ARTURIResource } from "../../models/ARTResources";
import { TransitiveImportMethodAllowance } from "../../models/Metadata";
import { ConfigurableExtensionFactory, ExtensionPointID, Plugin, PluginSpecification, Settings } from "../../models/Plugins";
import { BackendTypesEnum, PreloadedDataSummary, RemoteRepositoryAccessConfig, Repository, RepositoryAccess, RepositoryAccessType } from "../../models/Project";
import { RDFFormat } from "../../models/RDFFormat";
import { DCT, OntoLex, OWL, RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";
import { ExtensionsServices } from "../../services/extensionsServices";
import { InputOutputServices } from "../../services/inputOutputServices";
import { PluginsServices } from "../../services/pluginsServices";
import { ProjectServices } from "../../services/projectServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
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

    //preload
    private readonly preloadOptNone: PreloadOpt = PreloadOpt.NONE;
    private readonly preloadOptFromLocalFile: PreloadOpt = PreloadOpt.FROM_LOCAL_FILE;
    private readonly preloadOptFromURI: PreloadOpt = PreloadOpt.FROM_URI;
    private readonly preloadOptFromDatasetCatalog: PreloadOpt = PreloadOpt.FROM_DATASET_CATALOG;
    private preloadOptList: PreloadOpt[] = [this.preloadOptNone, this.preloadOptFromLocalFile, this.preloadOptFromURI, this.preloadOptFromDatasetCatalog];
    private selectedPreloadOpt: PreloadOpt = this.preloadOptList[0];
    private preloadFile: File;
    private inputFormats: RDFFormat[];
    private selectedInputFormat: RDFFormat;
    private filePickerAccept: string;
    private preloadUri: string;
    private preloadCatalog: string; //id-title of the datasetCatalog
    private preloadedData: { summary: PreloadedDataSummary, option: PreloadOpt};

    private importAllowances: { allowance: TransitiveImportMethodAllowance, show: string }[] = [
        { allowance: TransitiveImportMethodAllowance.nowhere, show: "Do not resolve" },
        { allowance: TransitiveImportMethodAllowance.web, show: "Resolve from web" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, show: "Resolve from web with fallback to Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirror, show: "Resolve from Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, show: "Resolve from Ontology Mirror with fallback to Web" }
    ];
    private selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

    //baseURI
    private baseUriPrefixList: string[] = ["http://", "https://"];
    private baseUriPrefix: string = this.baseUriPrefixList[0];
    private baseUriSuffix: string;
    private baseUriForced: boolean = false;
    private baseUriLocked: boolean = false;

    //onto/lexical models
    private ontoModelList = [
        { value: new ARTURIResource(RDFS.uri), label: "RDFS" },
        { value: new ARTURIResource(OWL.uri), label: "OWL" },
        { value: new ARTURIResource(SKOS.uri), label: "SKOS" },
        { value: new ARTURIResource(OntoLex.uri), label: "OntoLex" }
    ];
    private ontoModelType: ARTURIResource = this.ontoModelList[1].value; //default OWL
    private ontoModelForced: boolean = false;
    private ontoModelLocked: boolean = false;

    private lexicalModelList = [
        { value: new ARTURIResource(RDFS.uri), label: "RDFS" },
        { value: new ARTURIResource(SKOS.uri), label: "SKOS" },
        { value: new ARTURIResource(SKOSXL.uri), label: "SKOSXL" },
        { value: new ARTURIResource(OntoLex.uri), label: "OntoLex" }
    ];
    private lexicalModelType: ARTURIResource = this.lexicalModelList[0].value;
    private lexicalModelForced: boolean = false;
    private lexicalModelLocked: boolean = false;

    //history/validation
    private history: boolean = false;
    private validation: boolean = false;
    private blacklisting: boolean = false;

    /**
     * DATA STORE
     */
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
        private inOutService: InputOutputServices, private router: Router, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
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

    /** =============================================================
     * =================== PRELOAD HANDLERS ==========================
     * ============================================================= */

    private onPreloadChange() {
        //reset preload info
        this.baseUriForced = false;
        this.baseUriLocked = false;
        this.ontoModelForced = false;
        this.ontoModelLocked = false;
        this.lexicalModelForced = false;
        this.lexicalModelLocked = false;
        this.preloadFile = null;
        this.preloadUri = null;
        this.preloadCatalog = null;
        this.preloadedData = null;

        if (this.selectedPreloadOpt == PreloadOpt.FROM_LOCAL_FILE) {
            if (this.inputFormats == null) {
                this.initDataFormats();
            }
        }
    }

    private preloadFromFileChanged(file: File) {
        this.preloadFile = file;
        this.inOutService.getParserFormatForFileName(this.preloadFile.name).subscribe(
            format => {
                if (format != null) {
                    for (var i = 0; i < this.inputFormats.length; i++) {
                        if (this.inputFormats[i].name == format) {
                            this.selectedInputFormat = this.inputFormats[i];
                        }
                    }
                }
            }
        );
    }

    private preloadFromFile() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.preloadDataFromFile(this.preloadFile, this.selectedInputFormat.name).subscribe(
            (summary: PreloadedDataSummary) => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.preloadedResponseDataHandler(summary);
            }
        );
    }

    private initDataFormats() {
        this.inOutService.getInputRDFFormats().subscribe(
            formats => {
                this.inputFormats = formats;
                let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
                //set rdf/xml format as default
                let rdfIdx: number = 0;
                for (var i = 0; i < this.inputFormats.length; i++) {
                    this.inputFormats[i].fileExtensions.forEach(ext => extList.push("."+ext)); //add all the extension of the format to the extList
                    if (this.inputFormats[i].name == "RDF/XML") {
                        rdfIdx = i;
                    }
                }
                this.selectedInputFormat = this.inputFormats[rdfIdx];
                //remove duplicated extensions
                extList = extList.filter((item: string, pos: number) => {
                    return extList.indexOf(item) == pos;
                });
                this.filePickerAccept = extList.join(",");
            }
        )
    }

    private preloadFromUri() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.preloadDataFromURL(this.preloadUri).subscribe(
            (summary: PreloadedDataSummary) => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.preloadedResponseDataHandler(summary);
            }
        );
    }

    private preloadFromDatasetCatalog() {
        this.sharedModals.datasetCatalog().then(
            (data: DatasetCatalogModalReturnData) => {
                this.preloadCatalog = data.dataset.id + " - " + data.dataset.getPreferredTitle().getValue() + " @" + data.dataset.getPreferredTitle().getLang();
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);

                let datasetCatalogPreloadUri: string;
                if (data.dataDump != null) {
                    datasetCatalogPreloadUri = data.dataDump.accessURL;
                } else if (data.dataset.ontologyIRI != null) {
                    datasetCatalogPreloadUri = data.dataset.ontologyIRI.getURI();
                }

                if (datasetCatalogPreloadUri != null) {
                    this.projectService.preloadDataFromURL(datasetCatalogPreloadUri).subscribe(
                        (summary: PreloadedDataSummary) => {
                            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                            this.preloadedResponseDataHandler(summary);
                        }
                    );
                } else {
                    this.basicModals.alert("Preload from Dataset Catalog", "The selected dataset doesn't have a data dump neither an ontology IRI, so cannot be used to preload data.", "warning");
                }
            },
            () => {}
        );
    }

    private preloadedResponseDataHandler(summary: PreloadedDataSummary) {
        if (summary.warnings.length > 0) {
            let message: string = "";
            summary.warnings.forEach(w => {
                message += w.message+"\n";
            })
            this.basicModals.alert("Preload data", message, "warning");
        }
        this.preloadedData = {
            summary: summary,
            option: this.selectedPreloadOpt
        }
        if (summary.baseURI != null) {
            this.forceBaseURI(summary.baseURI);
            this.baseUriForced = true;
            this.baseUriLocked = true;
        }
        if (summary.model != null) {
            this.forceOntoModel(summary.model.getURI());
            this.ontoModelForced = true;
            this.ontoModelLocked = true;
        }
        if (summary.lexicalizationModel != null) {
            this.forceLexicalModel(summary.lexicalizationModel.getURI());
            this.lexicalModelForced = true;
            this.lexicalModelLocked = true;
        }
    }

    //================ PRELOAD HANDLERS - END =======================

    /** =============================================================
     * =================== BASEURI HANDLERS ==========================
     * ============================================================= */

    /**
     * When user paste a uri update baseUriPrefix and baseUriSuffix
     * @param event
     */
    private onBaseUriPaste(event: ClipboardEvent) {
        let pastedText = event.clipboardData.getData("text/plain");
        this.forceBaseURI(pastedText, event);
    }

    /**
     * Forces the given baseURI. This method is useful in case of pasted baseURI (event is provided),
     * or in case of baseURI obtained after a data preload
     */
    private forceBaseURI(baseURI: string, event?: ClipboardEvent) {
        for (var i = 0; i < this.baseUriPrefixList.length; i++) {
            let pref = this.baseUriPrefixList[i];
            if (baseURI.startsWith(pref)) {
                this.baseUriPrefix = pref;
                this.baseUriSuffix = baseURI.substring(this.baseUriPrefix.length);
                if (event) event.preventDefault();
                break;
            }
        }
    }

    //=============== BASEURI HANDLERS - END ========================

    /** =============================================================
     * =================== MODELS HANDLERS ==========================
     * ============================================================= */

    private onOntoModelChanged() {
        if (this.ontoModelType.getURI() == OntoLex.uri && !this.lexicalModelForced) {
            this.forceLexicalModel(OntoLex.uri);
        }
    }

    private forceOntoModel(ontoModelUri: string) {
        this.ontoModelList.forEach(ontoModel => {
                if (ontoModel.value.getURI() == ontoModelUri) {
                    this.ontoModelType =  ontoModel.value;
                }
            }
        );
    }

    private forceLexicalModel(lexicalModelUri: string) {
        this.lexicalModelList.forEach(lexModel => {
                if (lexModel.value.getURI() == lexicalModelUri) {
                    this.lexicalModelType =  lexModel.value;
                }
            }
        );
    }

    /**
     * Useful in the view to "lock" the selection of lexicalization to OntoLex in case the ontoModel is OntoLex
     */
    private isOntoModelOntolex() {
        return this.ontoModelType.getURI() == OntoLex.uri;
    }

    //================= MODELS HANDLERS - END =======================

    /** =============================================================
     * ========= DATA STORE MANAGEMENT (REPOSITORY ACCESS) ==========
     * ============================================================= */

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

    //=============== DATA STORE MANAGEMENT - END ===================

    /** =============================================================
     * ===================== OPTIONAL SETTINGS  =====================
     * ============================================================= */

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

    //================ OPTIONAL SETTINGS - END =====================


    private createtNew() {

        //check project name
        if (!this.projectName || this.projectName.trim() == "") {
            this.basicModals.alert("Create project", "Project name is missing or not valid", "warning");
            return;
        }

        //check preloading data
        if (this.selectedPreloadOpt != this.preloadOptNone && this.preloadedData == null) {
            this.basicModals.alert("Create project", "No data preloaded. Please, load data or select '" + this.preloadOptNone + "' if you don't want to preload any.", "warning");
            return
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

        let preloadedDataFileName: string;
        let preloadedDataFormat: string;
        let transitiveImportAllowance: TransitiveImportMethodAllowance;
        if (this.preloadedData) {
            preloadedDataFileName = this.preloadedData.summary.preloadedDataFile;
            if (this.preloadedData.option == PreloadOpt.FROM_LOCAL_FILE) {
                preloadedDataFormat = this.selectedInputFormat.name
            } else {
                preloadedDataFormat = this.preloadedData.summary.preloadedDataFormat
            }
            transitiveImportAllowance = this.selectedImportAllowance;
        }

        /**
         * Execute request
         */
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.createProject(this.projectName, this.baseUriPrefix + this.baseUriSuffix,
            this.ontoModelType, this.lexicalModelType, this.history, this.validation, this.blacklisting,
            repositoryAccess, this.dataRepoId, this.supportRepoId,
            coreRepoSailConfigurerSpecification, coreRepoBackendType,
            supportRepoSailConfigurerSpecification, supportRepoBackendType,
            uriGeneratorSpecification, renderingEngineSpecification,
            creationProp, modificationProp,
            preloadedDataFileName, preloadedDataFormat, transitiveImportAllowance).subscribe(
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

enum PreloadOpt {
    NONE = "Do not preload any data",
    FROM_LOCAL_FILE = "Preload from local file",
    FROM_URI = "Preload from URI",
    FROM_DATASET_CATALOG = "Preload from Dataset Catalog"
}