import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Language, Languages } from "src/app/models/LanguagesCountries";
import { SettingsServices } from "src/app/services/settingsServices";
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { DatasetCatalogModalReturnData } from "../../config/dataManagement/datasetCatalog/datasetCatalogModal";
import { ARTLiteral, ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { TransitiveImportMethodAllowance, TransitiveImportUtils } from "../../models/Metadata";
import { ConfigurableExtensionFactory, ExtensionFactory, ExtensionPointID, PluginSpecification, Scope, Settings } from "../../models/Plugins";
import { BackendTypesEnum, PreloadedDataSummary, Project, RemoteRepositoryAccessConfig, Repository, RepositoryAccess, RepositoryAccessType } from "../../models/Project";
import { ProjectCreationPreferences, SettingsEnum } from "../../models/Properties";
import { RDFFormat } from "../../models/RDFFormat";
import { PatternStruct } from "../../models/ResourceMetadata";
import { Pair } from "../../models/Shared";
import { EDOAL, OntoLex, OWL, RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";
import { MetadataFactoryPatternSelectionModal } from "../../resourceMetadata/modals/metadataFactoryPatternSelectionModal";
import { ExtensionsServices } from "../../services/extensionsServices";
import { InputOutputServices } from "../../services/inputOutputServices";
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
    projectName: string;

    //preload
    readonly preloadOptNone: PreloadOpt = PreloadOpt.NONE;
    readonly preloadOptFromLocalFile: PreloadOpt = PreloadOpt.FROM_LOCAL_FILE;
    readonly preloadOptFromURI: PreloadOpt = PreloadOpt.FROM_URI;
    readonly preloadOptFromDatasetCatalog: PreloadOpt = PreloadOpt.FROM_DATASET_CATALOG;
    preloadOptList: PreloadOpt[] = [this.preloadOptNone, this.preloadOptFromLocalFile, this.preloadOptFromURI, this.preloadOptFromDatasetCatalog];
    selectedPreloadOpt: PreloadOpt = this.preloadOptList[0];
    private preloadFile: File;
    private inputFormats: RDFFormat[];
    private selectedInputFormat: RDFFormat;
    private filePickerAccept: string;
    private preloadUri: string;
    private preloadCatalog: string; //id-title of the datasetCatalog
    preloadedData: { summary?: PreloadedDataSummary, option: PreloadOpt };

    importAllowances: { allowance: TransitiveImportMethodAllowance, showTranslationKey: string }[] = TransitiveImportUtils.importAllowancesList;
    selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

    projectLabel: ARTLiteral;
    projectLabelLang: Language;

    //baseURI
    baseUri: string;
    baseUriForced: boolean = false;
    baseUriLocked: boolean = false;

    //onto/lexical models
    ontoModelList = [
        { value: new ARTURIResource(RDFS.uri), label: "RDFS" },
        { value: new ARTURIResource(OWL.uri), label: "OWL" },
        { value: new ARTURIResource(SKOS.uri), label: "SKOS" },
        { value: new ARTURIResource(OntoLex.uri), label: "OntoLex" },
        { value: new ARTURIResource(EDOAL.uri), label: "EDOAL" }
    ];
    ontoModelType: ARTURIResource = this.ontoModelList[1].value; //default OWL
    ontoModelForced: boolean = false;
    ontoModelLocked: boolean = false;

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
    history: boolean = false;
    validation: boolean = false;
    blacklisting: boolean = false;

    //edoal
    private projectList: Project[];
    private leftProjectList: Project[];
    private leftProject: Project;
    private rightProjectList: Project[];
    private rightProject: Project;

    /**
     * DATA STORE
     */
    repositoryAccessList: RepositoryAccessType[] = [
        RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote, RepositoryAccessType.AccessExistingRemote
    ]
    selectedRepositoryAccess: RepositoryAccessType = this.repositoryAccessList[0];

    //configuration of remote access (used only in case selectedRepositoryAccess is one of CreateRemote or AccessExistingRemote)
    private remoteRepoConfigs: RemoteRepositoryAccessConfig[] = [];
    private selectedRemoteRepoConfig: RemoteRepositoryAccessConfig;

    private DEFAULT_REPO_EXTENSION_ID = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.PredefinedRepositoryImplConfigurer";
    private DEFAULT_REPO_CONFIG_TYPE = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.RDF4JNativeSailConfigurerConfiguration";

    //core repository containing data
    dataRepoId: string;
    private dataRepoExtensions: ConfigurableExtensionFactory[];
    private selectedDataRepoExtension: ConfigurableExtensionFactory;
    private selectedDataRepoConfig: Settings;

    //support repository for history and validation
    supportRepoId: string;
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

    extPointPanelOpen: boolean = false;

    //URI GENERATOR PLUGIN
    private uriGenUseDefaultSetting: boolean = true;
    private uriGenExtensions: ConfigurableExtensionFactory[]; //available extensions for uri generator (retrieved through getExtensions)
    private selectedUriGenExtension: ConfigurableExtensionFactory; //chosen extension for uri generator (the one selected through a <select> element)
    private selectedUriGenExtensionConf: Settings; //chosen configuration for the chosen uri generator extension (selected through a <select> element)

    //RENDERING GENERATOR PLUGIN
    private rendEngUseDefaultSetting: boolean = true;
    private rendEngExtensions: ConfigurableExtensionFactory[]; //available extensions for rendering engine
    private selectedRendEngExtension: ConfigurableExtensionFactory; //chosen extension for rendering engine
    private selectedRendEngExtensionConf: Settings; //chosen configuration for the chosen rendering engine extension

    //RESOURCE METADATA
    private useResourceMetadata: boolean = false;
    private resourceTypes: RoleStruct[];
    private metadataAssociations: MetadataAssociationStruct[] = [{ role: null, pattern: null }];

    //SHACL
    private enableSHACL: boolean = false;
    private shaclSettings: Settings;

    enableTrivialInference: boolean = false;
    private openAtStartup: boolean = false;
    private globallyAccessible: boolean = false;

    private eventSubscriptions: Subscription[] = [];

    constructor(private projectService: ProjectServices, private extensionService: ExtensionsServices,
        private inOutService: InputOutputServices, private settingsService: SettingsServices,
        private translateService: TranslateService, private router: Router,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal) {
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
        this.extensionService.getExtensions(ExtensionPointID.URI_GENERATOR_ID).subscribe(
            (extensions: ExtensionFactory[]) => {
                this.uriGenExtensions = <ConfigurableExtensionFactory[]>extensions;
            }
        );

        //init rendering engine plugin
        this.extensionService.getExtensions(ExtensionPointID.RENDERING_ENGINE_ID).subscribe(
            (extensions: ExtensionFactory[]) => {
                this.rendEngExtensions = <ConfigurableExtensionFactory[]>extensions;
            }
        );

        //init system settings
        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM).subscribe(
            settings => {
                //globally accessible and open at startup
                let projCreationSettings: ProjectCreationPreferences = settings.getPropertyValue(SettingsEnum.projectCreation, new ProjectCreationPreferences());
                this.globallyAccessible = projCreationSettings.aclUniversalAccessDefault;
                this.openAtStartup = projCreationSettings.openAtStartUpDefault;
            }
        );

        //init project list for EDOAL
        this.initProjectList();


        this.resourceTypes = [RDFResourceRolesEnum.undetermined, RDFResourceRolesEnum.annotationProperty, RDFResourceRolesEnum.cls,
            RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, RDFResourceRolesEnum.dataRange, 
            RDFResourceRolesEnum.datatypeProperty, RDFResourceRolesEnum.individual, RDFResourceRolesEnum.limeLexicon, 
            RDFResourceRolesEnum.objectProperty, RDFResourceRolesEnum.ontolexForm, RDFResourceRolesEnum.ontolexLexicalEntry,
            RDFResourceRolesEnum.ontolexLexicalSense, RDFResourceRolesEnum.ontology, RDFResourceRolesEnum.ontologyProperty,
            RDFResourceRolesEnum.property, RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.skosOrderedCollection, 
            RDFResourceRolesEnum.xLabel].map(r => { 
                return { role: r, show: ResourceUtils.getResourceRoleLabel(r, true) 
            }
        })

        //init available remote repo access configurations
        this.initRemoteRepoAccessConfigurations();

        //init language of the project label according the one chosen for the i18n
        let currentLang: string = this.translateService.currentLang;
        this.projectLabelLang = Languages.getLanguageFromTag(currentLang);

        this.eventSubscriptions.push(this.translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
                if (this.projectLabel == null) { //update the lang only if the project label has not been already set
                    this.projectLabelLang = Languages.getLanguageFromTag(event.lang);
                }
            })
        );
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    /**
     * If the user is creation a project (not accessing an existing one),
     * the data and history-validation repositories IDs are determined from project's name
     */
    onProjectNameChange() {
        if (this.isSelectedRepoAccessCreateMode() && this.projectName != null) {
            this.dataRepoId = this.projectName.trim().replace(new RegExp(" ", 'g'), "_") + "_core";
            this.supportRepoId = this.projectName.trim().replace(new RegExp(" ", 'g'), "_") + "_support";
        }
    }

    /** =============================================================
     * =================== PRELOAD HANDLERS ==========================
     * ============================================================= */

    onPreloadChange() {
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
        //reset stuff about preload from file
        if (this.preloadedData) {
            this.preloadedData.summary = null;
        }
        this.baseUriForced = false;
        this.baseUriLocked = false;
        this.ontoModelForced = false;
        this.ontoModelLocked = false;
        this.lexicalModelForced = false;
        this.lexicalModelLocked = false;
        //update the file and infer the input file format
        this.preloadFile = file;
        this.inOutService.getParserFormatForFileName(this.preloadFile.name).subscribe(
            format => {
                if (format != null) {
                    for (let i = 0; i < this.inputFormats.length; i++) {
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
                for (let i = 0; i < this.inputFormats.length; i++) {
                    this.inputFormats[i].fileExtensions.forEach(ext => extList.push("." + ext)); //add all the extension of the format to the extList
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
                    this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.CANNOT_PRELOAD_DATA_FROM_DATASET"}, ModalType.warning);
                }
            },
            () => { }
        );
    }

    private preloadedResponseDataHandler(summary: PreloadedDataSummary) {
        if (summary.warnings.length > 0) {
            let message: string = "";
            summary.warnings.forEach(w => {
                message += w.message + "\n";
            })
            this.basicModals.alert({key:"STATUS.WARNING"}, message, ModalType.warning);
        }
        this.preloadedData = {
            summary: summary,
            option: this.selectedPreloadOpt
        }
        if (summary.baseURI != null) {
            this.baseUri = summary.baseURI;
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
     * =================== MODELS HANDLERS ==========================
     * ============================================================= */

    onOntoModelChanged() {
        if (this.ontoModelType.getURI() == OntoLex.uri && !this.lexicalModelForced) {
            this.forceLexicalModel(OntoLex.uri);
        } else if (this.isEdoalProject() && !this.lexicalModelForced) {
            this.forceLexicalModel(RDFS.uri);
        }
    }

    private forceOntoModel(ontoModelUri: string) {
        this.ontoModelList.forEach(ontoModel => {
            if (ontoModel.value.getURI() == ontoModelUri) {
                this.ontoModelType = ontoModel.value;
            }
        });
    }

    private forceLexicalModel(lexicalModelUri: string) {
        this.lexicalModelList.forEach(lexModel => {
            if (lexModel.value.getURI() == lexicalModelUri) {
                this.lexicalModelType = lexModel.value;
            }
        });
    }

    isEdoalProject(): boolean {
        return this.ontoModelType.getURI() == EDOAL.uri;
    }

    /**
     * Useful in the view to "lock" the selection of lexicalization to OntoLex in case the ontoModel is OntoLex
     */
    isOntoModelOntolex() {
        return this.ontoModelType.getURI() == OntoLex.uri;
    }

    //================= MODELS HANDLERS - END =======================

    /** =============================================================
     * ================== EDOAL PROJECTS HANDLERS ===================
     * ============================================================= */

    private initProjectList() {
        this.projectService.listProjects().subscribe(
            projects => {
                this.projectList = projects.filter(p => p.getRepositoryLocation().location == "remote");
                //init left project list
                this.leftProjectList = [];
                this.projectList.forEach(p => {
                    this.leftProjectList.push(p);
                });
            }
        );
    }

    private updateRightProjectList() {
        this.rightProjectList = [];
        this.projectList.forEach(p => { //right dataset must be different from the left one
            if (p.getName() != this.leftProject.getName()) {
                this.rightProjectList.push(p);
            }
        });
    }

    //============= EDOAL PROJECTS HANDLERS - END ==================

    /** =============================================================
     * ========= DATA STORE MANAGEMENT (REPOSITORY ACCESS) ==========
     * ============================================================= */

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

    onRepoAccessChange() {
        if (this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote) {
            this.onProjectNameChange()
        }
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
    private configureRemoteRepositoryAccess() {
        this.sharedModals.configureRemoteRepositoryAccess().then(
            () => {
                this.initRemoteRepoAccessConfigurations();
            }
        );
    }

    changeRemoteRepository(repoType: "data" | "support") {
        if (this.selectedRemoteRepoConfig == null) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.REMOTE_REPO_ACCESS_CONFIG_NOT_SELECTED"}, ModalType.warning);
            return;
        }

        let title: string = repoType == "data" ? "Select Remote Data Repository" : "Select Remote History/Validation Repository";
        this.sharedModals.selectRemoteRepository(title, this.selectedRemoteRepoConfig).then(
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

    /**
     * RESOURCE METADATA
     */

    private selectMetadataPattern(metadataAssociation: MetadataAssociationStruct) {
        const modalRef: NgbModalRef = this.modalService.open(MetadataFactoryPatternSelectionModal, new ModalOptions());
        modalRef.componentInstance.title = "Select a pattern";
        return modalRef.result.then(
            (pattern: PatternStruct) => {
                metadataAssociation.pattern = pattern;
            },
            () => {}
        );
    }

    private addMetadataAssociation() {
        this.metadataAssociations.push({ role: null, pattern: null });
    }
    private removeMetadataAssociation(metadataAssociation: MetadataAssociationStruct) {
        if (this.metadataAssociations.length == 1) { //if deleting the only association, just reset it
            this.metadataAssociations[0].role = null;
            this.metadataAssociations[0].pattern = null;
        } else {
            this.metadataAssociations.slice(this.metadataAssociations.indexOf(metadataAssociation), 1);
        }
    }

    /**
     * SHACLE
     */

    onShacleEnableChange() {
        //initialize the shacle settings if are still not
        if (this.enableSHACL && this.shaclSettings == null) {
            this.projectService.createEmptySHACLSettingsForm().subscribe(
                settings => {
                    this.shaclSettings = settings;
                }
            );
        }
    }

    //================ OPTIONAL SETTINGS - END =====================


    create() {

        //check project name
        if (!this.projectName || this.projectName.trim() == "") {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key:"MESSAGES.MISSING_OR_INVALID_PROJECT_NAME"}, ModalType.warning);
            return;
        }

        //check preloading data
        if (this.selectedPreloadOpt != this.preloadOptNone && this.preloadedData == null) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, 
                {key:"MESSAGES.MISSING_PRELOAD_DATA_SELECT_NO_PRELOAD", params:{doNotPreloadOpt: this.translateService.instant(this.preloadOptNone)}},
                ModalType.warning);
            return
        }

        //check baseURI
        if (!this.baseUri || this.baseUri.trim() == "" || !ResourceUtils.testIRI(this.baseUri)) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key:"MESSAGES.MISSING_OR_INVALID_BASEURI"}, ModalType.warning);
            return;
        }

        //check EDOAL projects
        if (this.isEdoalProject()) {
            if (this.leftProject == null || this.rightProject == null) {
                this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key:"MESSAGES.MISSING_LEFT_RIGHT_DATASET"}, ModalType.warning);
                return;
            }
        }

        /**
         * Prepare repositoryAccess parameter
         */
        let repositoryAccess: RepositoryAccess = new RepositoryAccess(this.selectedRepositoryAccess);
        //if the selected repo access is remote, add the configuration 
        if (this.isSelectedRepoAccessRemote()) {
            //check if configuration is set
            if (this.selectedRemoteRepoConfig == null) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.REMOTE_REPO_ACCESS_CONFIG_NOT_SELECTED"}, ModalType.warning);
                return;
            }
            repositoryAccess.setConfiguration(this.selectedRemoteRepoConfig);
        }

        /**
         * Prepare core repo parameters
         */
        let coreRepoSailConfigurerSpecification: PluginSpecification
        //prepare config of core repo only if it is in creation mode
        if (this.isSelectedRepoAccessCreateMode()) {
            //check if data repository configuration needs to be configured
            if (this.selectedDataRepoConfig.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_DATA_REPO_CONFIG"}, ModalType.warning);
                return;
            }

            coreRepoSailConfigurerSpecification = {
                factoryId: this.selectedDataRepoExtension.id,
                configType: this.selectedDataRepoConfig.type,
                configuration: this.selectedDataRepoConfig.getPropertiesAsMap()
            }
        }

        /**
         * Prepare support repo parameters
         */

        //supportRepoId is mandatory, in this way avoid to pass it as null (possible in came the user changes the title with remote repoAccess)
        let supportRepoIdPar = (this.supportRepoId != null) ? this.supportRepoId : this.projectName + "_support";

        let supportRepoSailConfigurerSpecification: PluginSpecification
        //prepare config of core repo only if it is in creation mode and one of history and validation is enabled
        if ((this.validation || this.history) && this.isSelectedRepoAccessCreateMode()) {
            if (this.selectedSupportRepoConfig.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_HISTORY_VALIDATION_REPO_CONFIG"}, ModalType.warning);
                return;
            }

            supportRepoSailConfigurerSpecification = {
                factoryId: this.selectedSupportRepoExtension.id,
                configType: this.selectedSupportRepoConfig.type,
                configuration: this.selectedSupportRepoConfig.getPropertiesAsMap()
            }
        }

        //backend types
        let coreRepoBackendType: BackendTypesEnum;
        let supportRepoBackendType: BackendTypesEnum;
        if (!this.isSelectedRepoAccessCreateMode()) {
            coreRepoBackendType = this.selectedCoreRepoBackendType;
            if (this.validation || this.history) {
                supportRepoBackendType = this.selectedSupportRepoBackendType;
            }
        }

        //edoal configuration;
        let leftDataset: string;
        let rightDataset: string;
        if (this.isEdoalProject()) {
            leftDataset = this.leftProject.getName();
            rightDataset = this.rightProject.getName();
        }

        /**
         * Prepare uriGeneratorSpecification parameter
         */
        let uriGeneratorSpecification: PluginSpecification;
        if (!this.uriGenUseDefaultSetting) {
            //check if uriGenerator plugin needs to be configured
            if (this.selectedUriGenExtensionConf?.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_URI_GENERATOR_CONFIG"}, ModalType.warning);
                return;
            }
            uriGeneratorSpecification = {
                factoryId: this.selectedUriGenExtension.id,
                configuration: this.selectedUriGenExtensionConf?.getPropertiesAsMap(true)
            }
        }

        /**
         * Prepare renderingEngineSpecification parameter
         */
        let renderingEngineSpecification: PluginSpecification;
        if (!this.rendEngUseDefaultSetting) {
            //check if uriGenerator plugin needs to be configured
            if (this.selectedRendEngExtensionConf?.requireConfiguration()) {
                //...and in case if every required configuration parameters are not null
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_RENDERING_ENGINE_CONFIG"}, ModalType.warning);
                return;
            }

            renderingEngineSpecification = {
                factoryId: this.selectedRendEngExtension.id,
                configuration: this.selectedRendEngExtensionConf.getPropertiesAsMap(true)
            }
        }

        /**
         * Prepare stuff about preload data
         */
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
         * Prepare creationDateProperty and modificationDateProperty
         */
        let metadataAssociationsPar: Pair<RDFResourceRolesEnum, string>[];
        if (this.useResourceMetadata) { //resource metadata enabled => check if data is ok
            if (this.metadataAssociations.some(a => a.role == null || a.pattern == null)) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.INCOMPLETE_METADATA_PATTERN_ASSOCIATION"}, ModalType.warning);
                return;
            }
            metadataAssociationsPar = this.metadataAssociations.map(ma => {
                return { first: ma.role.role, second: ma.pattern.reference };
            });
        }

        /**
         * Prepare shacl settings
         */
        let shaclSettingsPar: Map<string, any>;
        if (this.enableSHACL && this.isSelectedRepoAccessCreateMode()) {
            shaclSettingsPar = new Map();
            if (this.shaclSettings.requireConfiguration()) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_SHACL_VALIDATION_CONFIG"}, ModalType.warning);
                return;
            }
            this.shaclSettings.properties.forEach(p => {
                shaclSettingsPar.set(p.name, p.value)
            });
        }

        /**
         * Execute request
         */
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.createProject(this.projectName, this.baseUri,
            this.ontoModelType, this.lexicalModelType, this.history, this.validation, this.blacklisting,
            repositoryAccess, this.dataRepoId, supportRepoIdPar, coreRepoSailConfigurerSpecification, coreRepoBackendType,
            supportRepoSailConfigurerSpecification, supportRepoBackendType, leftDataset, rightDataset,
            uriGeneratorSpecification, renderingEngineSpecification, metadataAssociationsPar, this.enableSHACL, shaclSettingsPar,
            this.enableTrivialInference, preloadedDataFileName, preloadedDataFormat, transitiveImportAllowance,
            this.openAtStartup, this.globallyAccessible, this.projectLabel).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                    this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.PROJECT_CREATED"}).then(
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
    NONE = "PROJECTS.PRELOAD.OPT.NONE",
    FROM_LOCAL_FILE = "PROJECTS.PRELOAD.OPT.FROM_LOCAL_FILE",
    FROM_URI = "PROJECTS.PRELOAD.OPT.FROM_URI",
    FROM_DATASET_CATALOG = "PROJECTS.PRELOAD.OPT.FROM_DATASET_CATALOG"
}

interface MetadataAssociationStruct { 
    role: RoleStruct;
    pattern: PatternStruct;
}
interface RoleStruct {
    role: RDFResourceRolesEnum;
    show: string;
}