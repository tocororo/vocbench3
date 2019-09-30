import { Component, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ConfigurationComponents } from "../../../models/Configuration";
import { DownloadDescription, TransitiveImportMethodAllowance } from "../../../models/Metadata";
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
    @ViewChild("loaderConfigurator") loaderConfigurator: ExtensionConfiguratorComponent;

    private baseURI: string;
    private useProjectBaseURI: boolean = true;

    private fileToUpload: File;

    private importAllowances: { allowance: TransitiveImportMethodAllowance, show: string }[] = [
        { allowance: TransitiveImportMethodAllowance.nowhere, show: "Do not resolve" },
        { allowance: TransitiveImportMethodAllowance.web, show: "From Web" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, show: "From Web with fallback to Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirror, show: "From Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, show: "From Ontology Mirror with fallback to Web" }
    ];
    private selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

    private validateImplicitly: boolean = false;


    //rdf transformator filter management
    private transformers: ConfigurableExtensionFactory[];
    private transformersChain: TransformerChainElement[] = [];
    private selectedTransformerChainElement: TransformerChainElement;

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
    private selectedInputFormat: DataFormat;
    private filePickerAccept: string;

    //dataset catalog
    private dataDumpUrl: string;


    private loaderOptions: { label: string, target: LoaderTarget }[] = [
        { label: "File", target: null },
        { label: "Dataset Catalog", target: LoaderTarget.datasetCatalog },
        { label: "Triple store", target: LoaderTarget.repository },
        { label: "Custom source", target: LoaderTarget.stream }
    ];
    private selectedLoader = this.loaderOptions[0];

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

    private onBaseUriChecboxChange() {
        if (this.useProjectBaseURI) {
            this.baseURI = VBContext.getWorkingProject().getBaseURI();
        }
    }

    private fileChangeEvent(file: File) {
        this.fileToUpload = file;
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.inOutService.getParserFormatForFileName(file.name).subscribe(
            format => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                if (format != null) {
                    for (var i = 0; i < this.inputFormats.length; i++) {
                        if (this.inputFormats[i].name == format) {
                            this.selectedInputFormat = this.inputFormats[i];
                            return;
                        }
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

    private onLifterExtensionUpdated(ext: ExtensionFactory) {
        this.selectedLifterExtension = ext;
        //input output getSupportedFormats
        this.inOutService.getSupportedFormats(this.selectedLifterExtension.id).subscribe(
            formats => {
                this.inputFormats = formats;
                let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
                //set rdf/xml format as default
                let rdfIdx: number = 0;
                for (var i = 0; i < this.inputFormats.length; i++) {
                    extList.push("."+this.inputFormats[i].defaultFileExtension);
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

    /** =====================================
     * Loader
     * =====================================*/


    /**
     * Loader is available only when "Triple store" or "Custom source" are selected as "Load from", so when the target is
     * repository or stream.
     */
    private showLoader(): boolean {
        return this.selectedLoader.target == LoaderTarget.repository || this.selectedLoader.target == LoaderTarget.stream
    }
    
    private onLoaderConfigStatusUpdated(statusEvent: { status: ExtensionConfigurationStatus, relativeReference?: string }) {
        this.loaderStatus = statusEvent.status;
        this.loaderRelativeRef = statusEvent.relativeReference;
    }

    private requireConfigurationLoader() {
        if (this.selectedLoaderConfig != null) {
            return this.selectedLoaderConfig.requireConfiguration();
        }
        return false;
    }


    /** =====================================
     * =========== FILTER CHAIN =============
     * =====================================*/

    private selectTransformerChainElement(filterChainEl: TransformerChainElement) {
        if (this.selectedTransformerChainElement == filterChainEl) {
            this.selectedTransformerChainElement = null;
        } else {
            this.selectedTransformerChainElement = filterChainEl;
        }
    }
    private isSelectedTransformerFirst(): boolean {
        return (this.selectedTransformerChainElement == this.transformersChain[0]);
    }
    private isSelectedTransformerLast(): boolean {
        return (this.selectedTransformerChainElement == this.transformersChain[this.transformersChain.length - 1]);
    }

    private appendTransformer() {
        this.transformersChain.push(new TransformerChainElement(this.transformers));
    }
    private removeTransformer() {
        this.transformersChain.splice(this.transformersChain.indexOf(this.selectedTransformerChainElement), 1);
        this.selectedTransformerChainElement = null;
    }
    private moveTransformerDown() {
        var prevIndex = this.transformersChain.indexOf(this.selectedTransformerChainElement);
        this.transformersChain.splice(prevIndex, 1); //remove from current position
        this.transformersChain.splice(prevIndex + 1, 0, this.selectedTransformerChainElement);
    }
    private moveTransformerUp() {
        var prevIndex = this.transformersChain.indexOf(this.selectedTransformerChainElement);
        this.transformersChain.splice(prevIndex, 1); //remove from current position
        this.transformersChain.splice(prevIndex - 1, 0, this.selectedTransformerChainElement);
    }

    private onExtensionUpdated(filterChainEl: TransformerChainElement, ext: ConfigurableExtensionFactory) {
        filterChainEl.selectedFactory = ext;
    }
    private onConfigurationUpdated(filterChainEl: TransformerChainElement, config: Settings) {
        filterChainEl.selectedConfiguration = config;
    }

    private onConfigStatusUpdated(filterChainEl: TransformerChainElement, statusEvent: { status: ExtensionConfigurationStatus, relativeReference?: string }) {
        filterChainEl.status = statusEvent.status;
        filterChainEl.relativeReference = statusEvent.relativeReference;
    }

    /**
     * Returns true if a plugin of the filter chain require edit of the configuration and it is not configured
     */
    private requireConfiguration(filterChainEl: TransformerChainElement): boolean {
        var conf: Settings = filterChainEl.selectedConfiguration;
        if (conf != null && conf.requireConfiguration()) { //!= null required because selectedConfiguration could be not yet initialized
            return true;
        }
        return false;
    }


    /** =====================================
     * Save/Load chain
     * =====================================*/

    private saveChain() {
        //transformationPipeline
        let transformationPipeline: { extensionID: string, configRef: string }[] = [];

        for (var i = 0; i < this.transformersChain.length; i++) {
            if (this.transformersChain[i].status == ExtensionConfigurationStatus.unsaved) {
                this.basicModals.alert("Unsaved configuration", "Transformer at position " + (i+1) + " is not saved. " +
                    "In order to save a transformer chain all its transformers need to be saved.", "warning");
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
                this.basicModals.alert("Unsaved configuration", "Loader configuration is not saved. " +
                    "In order to save the importer configuration all its sub-configurations need to be saved.", "warning");
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

        this.sharedModals.storeConfiguration("Save importer chain configuration", ConfigurationComponents.IMPORTER, config).then(
            () => {
                this.basicModals.alert("Save configuration", "Configuration saved succesfully");
            },
            () => {}
        );
    }

    private loadChain() {
        this.sharedModals.loadConfiguration("Load importer chain configuration", ConfigurationComponents.IMPORTER).then(
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

    private isValidationEnabled(): boolean {
        return VBContext.getWorkingProject().isValidationEnabled();
    }

    private isValidationAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.validation);
    }

    private isDataValid(): boolean {
        if (this.fileToUpload == null) {
            return false;
        } else if (this.baseURI == null || this.baseURI.trim() == "") {
            return false;
        }
    }

    private load() {
        let inputFilePar: File;
        let formatPar: string;
        let loaderSpec: PluginSpecification;
        let rdfLifterSpec: PluginSpecification;
        let tranformationPipeline: TransformationStep[] = [];
        let validateImplicitlyPar: boolean = this.isValidationEnabled() ? this.validateImplicitly : null;
        
        if (this.baseURI == null || this.baseURI.trim() == "") {
            this.basicModals.alert("Load Data", "BaseURI required", "warning");
            return;
        }

        //input file collected only if no loader target available (load from file)
        if (this.selectedLoader.target == null) {
            if (this.fileToUpload == null) {
                this.basicModals.alert("Load Data", "A file is required", "warning");
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
            formatPar = this.selectedInputFormat.name;
            //rdfLifterSpec
            rdfLifterSpec = {
                factoryId: this.selectedLifterExtension.id,
            }
            if (this.selectedLifterConfig != null) {
                if (this.selectedLifterConfig.requireConfiguration()) {
                    this.basicModals.alert("Missing configuration", "The Lifter needs to be configured", "warning");
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
                    this.basicModals.alert("Missing configuration", "The Loader needs to be configured", "warning");
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
                this.basicModals.alert("Import data", "Data imported successfully");
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