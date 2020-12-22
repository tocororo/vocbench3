import { Component, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ConfigurationComponents } from "../../../models/Configuration";
import { DownloadDescription, TransitiveImportMethodAllowance, TransitiveImportUtils } from "../../../models/Metadata";
import { ConfigurableExtensionFactory, ExtensionConfigurationStatus, ExtensionFactory, ExtensionPointID, PluginSpecification, Settings, SettingsProp, TransformationStep } from "../../../models/Plugins";
import { DataFormat } from "../../../models/RDFFormat";
import { ExtensionsServices } from "../../../services/extensionsServices";
import { InputOutputServices } from "../../../services/inputOutputServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { ExtensionConfiguratorComponent } from "../../../widget/extensionConfigurator/extensionConfiguratorComponent";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { DatasetCatalogModalReturnData } from "../datasetCatalog/datasetCatalogModal";

@Component({
    selector: "load-data-component",
    templateUrl: "./loadDataComponent.html",
    host: { class: "pageComponent" }
})
export class LoadDataComponent {

    //ExtensionConfiguratorComponent children of this Component (useful to load single configurations of a chain)
    @ViewChildren(ExtensionConfiguratorComponent) viewChildrenExtConfig: QueryList<ExtensionConfiguratorComponent>;
    @ViewChild("loaderConfigurator", { static: false }) loaderConfigurator: ExtensionConfiguratorComponent;

    baseURI: string;
    useProjectBaseURI: boolean = true;

    private fileToUpload: File;

    importAllowances: { allowance: TransitiveImportMethodAllowance, showTranslationKey: string }[] = TransitiveImportUtils.importAllowancesList;
    selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

    private validateImplicitly: boolean = false;


    //rdf transformator filter management
    private transformers: ConfigurableExtensionFactory[];
    transformersChain: TransformerChainElement[] = [];
    selectedTransformerChainElement: TransformerChainElement;

    //loaders
    private repoTargetLoaders: ConfigurableExtensionFactory[];
    private streamTargetLoaders: ConfigurableExtensionFactory[];
    private selectedLoaderExtension: ConfigurableExtensionFactory;
    private selectedLoaderConfig: Settings;

    private loaderStatus: ExtensionConfigurationStatus;
    private loaderRelativeRef: string;

    //lifters
    private lifters: ExtensionFactory[];
    private selectedLifterExtension: ExtensionFactory;
    private selectedLifterConfig: Settings;

    private inputFormats: DataFormat[];
    private forceFormat: boolean = false;
    private selectedInputFormat: DataFormat;
    private filePickerAccept: string;

    //dataset catalog
    private dataDumpUrl: string;


    loaderOptions: { label: string, target: LoaderTarget }[] = [
        { label: "File", target: null },
        { label: "Dataset Catalog", target: LoaderTarget.datasetCatalog },
        { label: "Triple store", target: LoaderTarget.repository },
        { label: "Custom source", target: LoaderTarget.stream }
    ];
    selectedLoader = this.loaderOptions[0];

    constructor(private inOutService: InputOutputServices, private extensionService: ExtensionsServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.baseURI = VBContext.getWorkingProject().getBaseURI();
        this.validateImplicitly = this.isValidationAuthorized();

        this.extensionService.getExtensions(ExtensionPointID.RDF_TRANSFORMERS_ID).subscribe(
            extensions => {
                this.transformers = <ConfigurableExtensionFactory[]>extensions;
            }
        );

        this.extensionService.getExtensions(ExtensionPointID.REPOSITORY_TARGETING_LOADER_ID).subscribe(
            extensions => {
                this.repoTargetLoaders = <ConfigurableExtensionFactory[]>extensions;
            }
        );

        this.extensionService.getExtensions(ExtensionPointID.STREAM_TARGETING_LOADER_ID).subscribe(
            extensions => {
                this.streamTargetLoaders = <ConfigurableExtensionFactory[]>extensions;
            }
        );

        this.extensionService.getExtensions(ExtensionPointID.RDF_LIFTER_ID).subscribe(
            extensions => {
                this.lifters = extensions;
            }
        );
    }

    onBaseUriChecboxChange() {
        if (this.useProjectBaseURI) {
            this.baseURI = VBContext.getWorkingProject().getBaseURI();
        }
    }

    fileChangeEvent(file: File) {
        this.fileToUpload = file;
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.inOutService.getParserFormatForFileName(file.name).subscribe(
            format => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                if (format != null && !this.forceFormat) {
                    let formatToSelect = this.inputFormats.find(f => f.name == format);
                    if (formatToSelect != null) {
                        this.selectedInputFormat = formatToSelect;
                    }
                }
            }
        );
    }

    /** =====================================
     * =========== DATASET CATALOG =============
     * =====================================*/

    loadFromDatasetCatalog() {
        this.sharedModals.datasetCatalog().then(
            (data: DatasetCatalogModalReturnData) => {
                let dataDump: DownloadDescription = data.dataDump;
                this.dataDumpUrl = dataDump.accessURL;
                let mimeType = dataDump.mimeType;
                if (mimeType != null) {
                    this.selectedInputFormat = this.inputFormats.find(f => f.defaultMimeType == mimeType);
                } else {
                    this.selectedInputFormat = null;
                    this.inOutService.getParserFormatForFileName(this.dataDumpUrl).subscribe(
                        format => {
                            this.selectedInputFormat = this.inputFormats.find(f => f.name == format);
                        }
                    )
                }
                /**
                 * When using the dataset catalog, in order to load data, it needs to use:
                 * - the loader HTTPLoader
                 * - the lifter RDFDeserializingLifter
                 */
                //force the loader to HttpLoader
                this.selectedLoaderExtension = this.streamTargetLoaders.find(l => l.id == "it.uniroma2.art.semanticturkey.extension.impl.loader.http.HTTPLoader");
                //set the accessURL of the dataDump as loader endpoint in the configuration
                this.selectedLoaderConfig = this.selectedLoaderExtension.configurations.find(c => c.type == "it.uniroma2.art.semanticturkey.extension.impl.loader.http.HTTPLoaderConfiguration");
                let endpointProp: SettingsProp = this.selectedLoaderConfig.properties.find(p => p.name == "endpoint");
                endpointProp.value = this.dataDumpUrl;
                //force the lifter to RDFDeserializingLifter
                this.selectedLifterExtension = this.lifters.find(l => l.id == "it.uniroma2.art.semanticturkey.extension.impl.rdflifter.rdfdeserializer.RDFDeserializingLifter");
            }
        );
    }

    /** =====================================
     * Lifter
     * =====================================*/

    onLifterExtensionUpdated(ext: ExtensionFactory) {
        this.selectedLifterExtension = ext;
        this.inOutService.getSupportedFormats(this.selectedLifterExtension.id).subscribe(
            formats => {
                this.inputFormats = formats;
                let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
                this.inputFormats.forEach(f => 
                    f.fileExtensions.forEach(ext => {
                        extList.push("."+ext);
                    })
                ); 
                //remove duplicated extensions
                extList = extList.filter((item: string, pos: number) => {
                    return extList.indexOf(item) == pos;
                });
                this.filePickerAccept = extList.join(",");
            }
        )
    }

    /** =====================================
     * Loader
     * =====================================*/


    /**
     * Loader is available only when "Triple store" or "Custom source" are selected as "Load from", so when the target is
     * repository or stream.
     */
    showLoader(): boolean {
        return this.selectedLoader.target == LoaderTarget.repository || this.selectedLoader.target == LoaderTarget.stream
    }
    
    onLoaderConfigStatusUpdated(statusEvent: { status: ExtensionConfigurationStatus, relativeReference?: string }) {
        this.loaderStatus = statusEvent.status;
        this.loaderRelativeRef = statusEvent.relativeReference;
    }

    requireConfigurationLoader() {
        if (this.selectedLoaderConfig != null) {
            return this.selectedLoaderConfig.requireConfiguration();
        }
        return false;
    }


    /** =====================================
     * =========== FILTER CHAIN =============
     * =====================================*/

    selectTransformerChainElement(filterChainEl: TransformerChainElement) {
        if (this.selectedTransformerChainElement == filterChainEl) {
            this.selectedTransformerChainElement = null;
        } else {
            this.selectedTransformerChainElement = filterChainEl;
        }
    }
    isSelectedTransformerFirst(): boolean {
        return (this.selectedTransformerChainElement == this.transformersChain[0]);
    }
    isSelectedTransformerLast(): boolean {
        return (this.selectedTransformerChainElement == this.transformersChain[this.transformersChain.length - 1]);
    }

    appendTransformer() {
        this.transformersChain.push(new TransformerChainElement(this.transformers));
    }
    removeTransformer() {
        this.transformersChain.splice(this.transformersChain.indexOf(this.selectedTransformerChainElement), 1);
        this.selectedTransformerChainElement = null;
    }
    moveTransformerDown() {
        var prevIndex = this.transformersChain.indexOf(this.selectedTransformerChainElement);
        this.transformersChain.splice(prevIndex, 1); //remove from current position
        this.transformersChain.splice(prevIndex + 1, 0, this.selectedTransformerChainElement);
    }
    moveTransformerUp() {
        var prevIndex = this.transformersChain.indexOf(this.selectedTransformerChainElement);
        this.transformersChain.splice(prevIndex, 1); //remove from current position
        this.transformersChain.splice(prevIndex - 1, 0, this.selectedTransformerChainElement);
    }

    onExtensionUpdated(filterChainEl: TransformerChainElement, ext: ConfigurableExtensionFactory) {
        filterChainEl.selectedFactory = ext;
    }
    onConfigurationUpdated(filterChainEl: TransformerChainElement, config: Settings) {
        filterChainEl.selectedConfiguration = config;
    }

    onConfigStatusUpdated(filterChainEl: TransformerChainElement, statusEvent: { status: ExtensionConfigurationStatus, relativeReference?: string }) {
        filterChainEl.status = statusEvent.status;
        filterChainEl.relativeReference = statusEvent.relativeReference;
    }

    /**
     * Returns true if a plugin of the filter chain require edit of the configuration and it is not configured
     */
    requireConfiguration(filterChainEl: TransformerChainElement): boolean {
        var conf: Settings = filterChainEl.selectedConfiguration;
        if (conf != null && conf.requireConfiguration()) { //!= null required because selectedConfiguration could be not yet initialized
            return true;
        }
        return false;
    }


    /** =====================================
     * Save/Load chain
     * =====================================*/

    saveChain() {
        //transformationPipeline
        let transformationPipeline: { extensionID: string, configRef: string }[] = [];

        for (var i = 0; i < this.transformersChain.length; i++) {
            if (this.transformersChain[i].status == ExtensionConfigurationStatus.unsaved) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.TRANSFORMER_NOT_SAVED", params:{position: i+1}}, ModalType.warning);
                return;
            }

            let transfStepConfig: { extensionID: string, configRef: string } = {
                extensionID: this.transformersChain[i].selectedFactory.id,
                configRef: this.transformersChain[i].relativeReference
            };

            transformationPipeline.push(transfStepConfig);
        }

        //loaderSpec
        let loaderSpec: { extensionID: string, configRef: string };
        if (this.selectedLoader.target != null) {
            if (this.loaderStatus == ExtensionConfigurationStatus.unsaved) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.LOADER_NOT_SAVED"}, ModalType.warning);
                return;
            }
            loaderSpec = {
                extensionID: this.selectedLoaderExtension.id,
                configRef: this.loaderRelativeRef
            }
        }

        let config: { [key: string]: any } = {
            transformationPipeline: transformationPipeline,
            loaderSpec: loaderSpec
        }

        this.sharedModals.storeConfiguration({key:"ACTIONS.SAVE_IMPORTER_CHAIN_CONFIGURATION"}, ConfigurationComponents.IMPORTER, config).then(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.CONFIGURATION_SAVED"});
            },
            () => {}
        );
    }

    loadChain() {
        this.sharedModals.loadConfiguration({key:"ACTIONS.LOAD_IMPORTER_CHAIN_CONFIGURATION"}, ConfigurationComponents.IMPORTER).then(
            (conf: LoadConfigurationModalReturnData) => {
                this.transformersChain = []; //reset the chain
                let configurations: SettingsProp[] = conf.configuration.properties;
                for (var i = 0; i < configurations.length; i++) {
                    if (configurations[i].name == "transformationPipeline") {
                        //value of a stored transformationPipeline (see loadConfiguration response)
                        let chain: {extensionID: string, configRef: string}[] = configurations[i].value;
                        //for each element of the pipeline append a transformer (so that a ExtensionConfiguratorComponent is instantiated for each one of them)
                        chain.forEach(() => {
                            this.appendTransformer();
                        });
                        //...and force a configuration
                        setTimeout(() => {  //wait that the ExtensionConfiguratorComponent for the new appended transformers are initialized
                            /**
                             * collect the ExtensionConfiguratorComponent for the transformators. This is necessary since
                             * there are also the ExtensionConfiguratorComponent for loader and lifter, so I need to ensure
                             * that the configuration is forced to the ExtensionConfiguratorComponent of the transformators
                             */
                            let tranformerConfigurators: ExtensionConfiguratorComponent[] = [];
                            //consider just the first step of the stored pipeline and iterate over all the ExtensionConfiguratorComponent
                            let firstTransformerExtId = chain[0].extensionID;
                            let extConfigurators: ExtensionConfiguratorComponent[] = this.viewChildrenExtConfig.toArray();
                            extConfigurators.forEach(extConfComp => {
                                extConfComp.extensions.forEach(ext => {
                                    if (ext.id == firstTransformerExtId) {
                                        tranformerConfigurators.push(extConfComp);
                                    }
                                });
                            });
                            //now iterate over the step of the stored pipeline and force the config of the tranformerConfigurators
                            chain.forEach((extConf : {extensionID: string, configRef: string}, index: number) => {
                                tranformerConfigurators[index].forceConfiguration(extConf.extensionID, extConf.configRef);
                            });
                        });
                    } else if (configurations[i].name == "loaderSpec") {
                        let loaderSpec: {extensionID: string, configRef: string} = configurations[i].value;
                        if (loaderSpec != null) { //loader specified, select the target loader in the menu
                            let found: boolean = false;
                            //look among stream-target loader
                            this.streamTargetLoaders.forEach((deployer: ExtensionFactory) => {
                                if (deployer.id == loaderSpec.extensionID) {
                                    //select the stream-sourced option in the menu
                                    this.loaderOptions.forEach(opt => {
                                        if (opt.target == LoaderTarget.stream) {
                                            this.selectedLoader = opt;
                                        }
                                    })
                                    found = true;
                                }
                            });
                            //loader not found among the stream-target loader, so the loader is repository sourced
                            if (!found) { 
                                //select the repository-sourced option in the menu
                                this.loaderOptions.forEach(opt => {
                                    if (opt.target == LoaderTarget.repository) {
                                        this.selectedLoader = opt;
                                    }
                                })
                            }
                            
                            setTimeout(() => {
                                this.loaderConfigurator.forceConfiguration(loaderSpec.extensionID, loaderSpec.configRef);
                            });
                        } else { //loader not specified
                            //select the no-loader option in the menu (from file)
                            this.loaderOptions.forEach(opt => {
                                if (opt.target == null) {
                                    this.selectedLoader = opt;
                                }
                            });
                        }
                    }
                }

            }
        );
    }

    //--------------------------------------

    isValidationEnabled(): boolean {
        return VBContext.getWorkingProject().isValidationEnabled();
    }

    private isValidationAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.validation);
    }

    isDataValid(): boolean {
        if (this.fileToUpload == null) {
            return false;
        } else if (this.baseURI == null || this.baseURI.trim() == "") {
            return false;
        }
    }

    load() {
        let inputFilePar: File;
        let formatPar: string;
        let loaderSpec: PluginSpecification;
        let rdfLifterSpec: PluginSpecification;
        let tranformationPipeline: TransformationStep[] = [];
        let validateImplicitlyPar: boolean = this.isValidationEnabled() ? this.validateImplicitly : null;
        
        if (this.baseURI == null || this.baseURI.trim() == "") {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.BASEURI_REQUIRED"}, ModalType.warning);
            return;
        }

        //input file collected only if no loader target available (load from file)
        if (this.selectedLoader.target == null) {
            if (this.fileToUpload == null) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.FILE_REQUIRED"}, ModalType.warning);
                return;
            }
            inputFilePar = this.fileToUpload;
        }
        
        /**
         * formatPar and rdfLifterSpec collected if loader target is
         * - stream (custom source)
         * - null (load from file)
         * - dataset catalog (even if for the latter is not show in the UI)
         */
        if (this.selectedLoader.target == null || this.selectedLoader.target == LoaderTarget.stream || this.selectedLoader.target == LoaderTarget.datasetCatalog) {
            if (this.selectedInputFormat == null) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.FORMAT_REQUIRED_NOT_DETECTED"}, ModalType.warning);
                return;
            }
            formatPar = this.selectedInputFormat.name;
            //rdfLifterSpec
            rdfLifterSpec = {
                factoryId: this.selectedLifterExtension.id,
            }
            if (this.selectedLifterConfig != null) {
                if (this.selectedLifterConfig.requireConfiguration()) {
                    this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.LIFTER_NOT_CONFIGURED"}, ModalType.warning);
                    return;
                }
                rdfLifterSpec.configType = this.selectedLifterConfig.type;
                rdfLifterSpec.configuration = this.selectedLifterConfig.getPropertiesAsMap();
            }
        }

        /**
         * loaderSpec collected if loader target is: 
         * - stream (custom source)
         * - repository (triple store)
         * - dataset catalog (even if for the latter is not show in the UI)
         */
        if (this.selectedLoader.target != null) {
            loaderSpec = {
                factoryId: this.selectedLoaderExtension.id,
            }
            if (this.selectedLoaderConfig != null) { //normally the loader is not configurable
                if (this.selectedLoaderConfig.requireConfiguration()) {
                    this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.LOADER_NOT_CONFIGURED"}, ModalType.warning);
                    return;
                }
                loaderSpec.configType = this.selectedLoaderConfig.type;
                loaderSpec.configuration = this.selectedLoaderConfig.getPropertiesAsMap();
            }
        }

        //tranformationPipeline
        for (var i = 0; i < this.transformersChain.length; i++) {
            tranformationPipeline.push(this.transformersChain[i].convertToTransformerPipelineStep());
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.inOutService.loadRDF(this.baseURI, this.selectedImportAllowance, inputFilePar, formatPar, loaderSpec, rdfLifterSpec, 
            JSON.stringify(tranformationPipeline), validateImplicitlyPar).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.DATA_IMPORTED"});
            }
        );
    }

}

class TransformerChainElement {
    public availableFactories: ConfigurableExtensionFactory[];
    public selectedFactory: ConfigurableExtensionFactory;
    public selectedConfiguration: Settings;
    public status: ExtensionConfigurationStatus;
    public relativeReference: string;

    constructor(availableFactories: ConfigurableExtensionFactory[]) {
        //clone the available factories, so changing the configuration of one of them, doesn't change the default of the others
        let availableFactClone: ConfigurableExtensionFactory[] = [];
        for (var i = 0; i < availableFactories.length; i++) {
            availableFactClone.push(availableFactories[i].clone());
        }
        this.availableFactories = availableFactClone;
    }

    convertToTransformerPipelineStep(): TransformationStep {
        let filterStep: TransformationStep = {filter: null};
        //filter: factoryId and properties
        var filter: {factoryId: string, configuration: any} = {
            factoryId: this.selectedFactory.id,
            configuration: null
        }
        var selectedConf: Settings = this.selectedConfiguration;
        
        filter.configuration = selectedConf.getPropertiesAsMap();
        filterStep.filter = filter;

        return filterStep;
    }
}

enum LoaderTarget {
    stream = "stream",
    repository = "repository",
    datasetCatalog = "datasetCatalog" //added for load from dataset catalog
}