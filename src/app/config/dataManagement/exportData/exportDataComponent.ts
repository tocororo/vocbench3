import { ChangeDetectorRef, Component, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { finalize } from 'rxjs/operators';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../../models/ARTResources";
import { ConfigurationComponents } from "../../../models/Configuration";
import { ConfigurableExtensionFactory, DeploySource, ExtensionConfigurationStatus, ExtensionFactory, ExtensionPointID, PluginSpecification, Settings, STProperties, TransformationStep } from "../../../models/Plugins";
import { DataFormat } from "../../../models/RDFFormat";
import { ExportServices } from "../../../services/exportServices";
import { ExtensionsServices } from "../../../services/extensionsServices";
import { STError } from "../../../utils/HttpManager";
import { UIUtils } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";
import { ExtensionConfiguratorComponent } from "../../../widget/extensionConfigurator/extensionConfiguratorComponent";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { FilterGraphsModal } from "./filterGraphsModal/filterGraphsModal";

@Component({
    selector: "export-data-component",
    templateUrl: "./exportDataComponent.html",
    host: { class: "pageComponent" }
})
export class ExportDataComponent {

    //ExtensionConfiguratorComponent children of this Component (useful to load single configurations of a chain)
    @ViewChildren(ExtensionConfiguratorComponent) viewChildrenExtConfig: QueryList<ExtensionConfiguratorComponent>;
    @ViewChild("deployerConfigurator", { static: false }) deployerConfigurator: ExtensionConfiguratorComponent;
    @ViewChild("reformatterConfigurator", { static: false }) reformatterConfigurator: ExtensionConfiguratorComponent;

    includeInferred: boolean = false;

    //graph selection
    exportGraphs: GraphStruct[] = [];

    //export filter management
    private filters: ConfigurableExtensionFactory[];
    filtersChain: TransformerChainElement[] = [];
    selectedFilterChainElement: TransformerChainElement;

    //reformatter
    private reformatters: ExtensionFactory[];
    private selectedReformatterExtension: ExtensionFactory;
    private selectedReformatterConfig: Settings;

    private reformatterStatus: ExtensionConfigurationStatus;
    private reformatterRelativeRef: string;

    private exportFormats: DataFormat[];
    private selectedExportFormat: DataFormat;

    //deployer
    private repoSourcedDeployer: ConfigurableExtensionFactory[];
    private streamSourcedDeployer: ConfigurableExtensionFactory[];
    private selectedDeployerExtension: ConfigurableExtensionFactory;
    private selectedDeployerConfig: Settings;

    private deployerStatus: ExtensionConfigurationStatus;
    private deployerRelativeRef: string;

    deploymentOptions: { translationKey: string, source: DeploySource }[] = [
        { translationKey: "DATA_MANAGEMENT.EXPORT.DEPLOY.SAVE_TO_FILE", source: null },
        { translationKey: "DATA_MANAGEMENT.EXPORT.DEPLOY.DEPLOY_TO_TRIPLE_STORE", source: DeploySource.repository },
        { translationKey: "DATA_MANAGEMENT.EXPORT.DEPLOY.USE_CUSTOM_DEPLOYER", source: DeploySource.stream }
    ];
    selectedDeployment = this.deploymentOptions[0];


    constructor(private extensionService: ExtensionsServices, private exportService: ExportServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal,
        private translateService: TranslateService, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        let baseURI: string = VBContext.getWorkingProject().getBaseURI();
        this.exportService.getNamedGraphs().subscribe(
            graphs => {
                graphs.sort((g1: ARTURIResource, g2: ARTURIResource) => {
                    return g1.getURI().localeCompare(g2.getURI());
                });
                for (let i = 0; i < graphs.length; i++) {
                    this.exportGraphs.push(new GraphStruct(graphs[i].getURI() == baseURI, graphs[i])); //set checked the project baseURI
                }
            }
        );

        this.extensionService.getExtensions(ExtensionPointID.RDF_TRANSFORMERS_ID).subscribe(
            extensions => {
                this.filters = <ConfigurableExtensionFactory[]>extensions;
            }
        );

        this.extensionService.getExtensions(ExtensionPointID.REFORMATTING_EXPORTER_ID).subscribe(
            extensions => {
                //sort extensions in order to force RDFSerializingExporter in 1st position, so selected as default
                extensions.sort((e1, e2) => {
                    if (e1.id.includes("RDFSerializingExporter")) {
                        return -1;
                    } else if (e2.id.includes("RDFSerializingExporter")) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                this.reformatters = extensions;
            }
        );

        this.extensionService.getExtensions(ExtensionPointID.REPOSITORY_SOURCED_DEPLOYER_ID).subscribe(
            extensions => {
                this.repoSourcedDeployer = <ConfigurableExtensionFactory[]>extensions;
            }
        );

        this.extensionService.getExtensions(ExtensionPointID.STREAM_SOURCED_DEPLOYER_ID).subscribe(
            extensions => {
                this.streamSourcedDeployer = <ConfigurableExtensionFactory[]>extensions;
            }
        );
    }

    /** =====================================
     * ============= GRAPHS =================
     * =====================================*/
    areAllGraphDeselected(): boolean {
        for (let i = 0; i < this.exportGraphs.length; i++) {
            if (this.exportGraphs[i].checked) {
                return false;
            }
        }
        return true;
    }

    /**
     * When a graph is included/excluded from the export, update the graph selection of the filters
     */
    onGraphSelectionChange(graphStruct: GraphStruct) {
        // if the graph is now selected, add it (as not selected since it was not included before) to the graphs selection of the filters
        if (graphStruct.checked) {
            if (this.collectCheckedGraphStructures().length == 1) {
                //if the current graphStruct is the only one selected means that previously every graph was unchecked,
                //so the filterChain element had all the graphs in the filterGraphs array.
                //In this case, now the filterGraphs array should contains only the just checked graph
                for (let i = 0; i < this.filtersChain.length; i++) {
                    this.filtersChain[i].filterGraphs = [new GraphStruct(false, graphStruct.graph)];
                }
            } else {
                for (let i = 0; i < this.filtersChain.length; i++) {
                    this.filtersChain[i].filterGraphs.push(new GraphStruct(false, graphStruct.graph));
                }
            }
        } else { //graph is now unselected
            //if now no graph is selected, add them all to the filterGraphs array of the filterChain elements
            if (this.areAllGraphDeselected()) {
                for (let i = 0; i < this.filtersChain.length; i++) {
                    this.filtersChain[i].filterGraphs = this.collectCheckedGraphStructures();
                }
            } else {
                //remove it from the graphs selection of the filters
                for (let i = 0; i < this.filtersChain.length; i++) {
                    let fg: GraphStruct[] = this.filtersChain[i].filterGraphs;
                    for (let j = 0; j < fg.length; j++) {
                        if (fg[j].graph.getURI() == graphStruct.graph.getURI()) {
                            fg.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        }
    }

    /** =====================================
     * =========== FILTER CHAIN =============
     * =====================================*/
    selectFilterChainElement(filterChainEl: TransformerChainElement) {
        if (this.selectedFilterChainElement == filterChainEl) {
            this.selectedFilterChainElement = null;
        } else {
            this.selectedFilterChainElement = filterChainEl;
        }
    }
    isSelectedFilterFirst(): boolean {
        return (this.selectedFilterChainElement == this.filtersChain[0]);
    }
    isSelectedFilterLast(): boolean {
        return (this.selectedFilterChainElement == this.filtersChain[this.filtersChain.length - 1]);
    }

    appendFilter() {
        this.filtersChain.push(new TransformerChainElement(this.filters, this.collectCheckedGraphStructures()));
    }
    removeFilter() {
        this.filtersChain.splice(this.filtersChain.indexOf(this.selectedFilterChainElement), 1);
        this.selectedFilterChainElement = null;
    }
    moveFilterDown() {
        let prevIndex = this.filtersChain.indexOf(this.selectedFilterChainElement);
        this.filtersChain.splice(prevIndex, 1); //remove from current position
        this.filtersChain.splice(prevIndex + 1, 0, this.selectedFilterChainElement);
    }
    moveFilterUp() {
        let prevIndex = this.filtersChain.indexOf(this.selectedFilterChainElement);
        this.filtersChain.splice(prevIndex, 1); //remove from current position
        this.filtersChain.splice(prevIndex - 1, 0, this.selectedFilterChainElement);
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

    configureGraphs(filterChainEl: TransformerChainElement) {
        this.openGraphSelectionModal(filterChainEl.filterGraphs).then(
            res => { },
            () => { }
        );
    }

    private openGraphSelectionModal(filterGraphs: GraphStruct[]) {
        const modalRef: NgbModalRef = this.modalService.open(FilterGraphsModal, new ModalOptions());
        modalRef.componentInstance.graphs = filterGraphs;
        return modalRef.result;
    }

    /**
     * Returns true if a plugin of the filter chain require edit of the configuration and it is not configured
     */
    private requireConfiguration(filterChainEl: TransformerChainElement): boolean {
        let conf: Settings = filterChainEl.selectedConfiguration;
        if (conf != null && conf.requireConfiguration()) { //!= null required because selectedConfiguration could be not yet initialized
            return true;
        }
        return false;
    }

    /** =====================================
     * Reformatter
     * =====================================*/

    /**
     * Returns true if a reformatter is used
     */
    useReformatter(): boolean {
        //Reformatter available only when not using a deployer, or when using a stream-source deployer
        return !this.selectedDeployment.source || this.selectedDeployment.source == DeploySource.stream;
    }

    onReformatterConfigUpdated(config: Settings) {
        //in order to prevent ExpressionChangedAfterItHasBeenCheckedError when calling requireConfigurationDeployer() in UI
        // this.changeDetectorRef.detectChanges();
        this.selectedReformatterConfig = config;
    }

    onReformatterExtensionUpdated(ext: ExtensionFactory) {
        /**
         * extensionUpdated event is emitted from the ExtensionConfigurator even when changes only its configuration.
         * Here I check if the selected extension is effectively changed
         */
        let extensionChanged: boolean = this.selectedReformatterExtension != null && this.selectedReformatterExtension.id != ext.id;
        this.selectedReformatterExtension = ext;
        //update the exportFormats if never initialized or if the selected extension has been changed
        if (extensionChanged || this.exportFormats == null) {
            this.exportService.getExportFormats(this.selectedReformatterExtension.id).subscribe(
                formats => {
                    this.exportFormats = formats;
                    //set rdf/xml format as default (if found)
                    let rdfIdx: number = 0;
                    for (let i = 0; i < this.exportFormats.length; i++) {
                        if (this.exportFormats[i].name == "RDF/XML") {
                            rdfIdx = i;
                            break;
                        }
                    }
                    this.selectedExportFormat = this.exportFormats[rdfIdx];
                }
            );
        }
    }

    private onReformatterConfigStatusUpdated(statusEvent: { status: ExtensionConfigurationStatus, relativeReference?: string }) {
        this.reformatterStatus = statusEvent.status;
        this.reformatterRelativeRef = statusEvent.relativeReference;
    }

    /**
     * Returns true if the reformatter requires edit of the configuration and it is not configured
     */
    private requireConfigurationFormatter(): boolean {
        if (this.selectedReformatterConfig != null) { //check required because config could be not yet initialized
            return this.selectedReformatterConfig.requireConfiguration();
        }
        return false;
    }

    /** =====================================
     * Deployer
     * =====================================*/

    /**
     * Returns true if a deployer is used
     */
    useDeployer(): boolean {
        //When a deployer source is specified (so a deployer is used)
        return this.selectedDeployment.source != null;
    }

    onDeployerConfigUpdated(config: Settings) {
        //in order to prevent ExpressionChangedAfterItHasBeenCheckedError when calling requireConfigurationDeployer() in UI
        // this.changeDetectorRef.detectChanges();
        this.selectedDeployerConfig = config;
    }

    onDeployerConfigStatusUpdated(statusEvent: { status: ExtensionConfigurationStatus, relativeReference?: string }) {
        this.deployerStatus = statusEvent.status;
        this.deployerRelativeRef = statusEvent.relativeReference;
    }

    requireConfigurationDeployer() {
        if (this.selectedDeployerConfig != null) {
            return this.selectedDeployerConfig.requireConfiguration();
        }
        return false;
    }

    /** =====================================
     * Save/Load chain
     * =====================================*/

    saveChain() {
        //graphs
        let graphs: string[] = [];
        for (let i = 0; i < this.exportGraphs.length; i++) {
            if (this.exportGraphs[i].checked) {
                graphs.push(this.exportGraphs[i].graph.toNT());
            }
        }

        //transformationPipeline
        let transformationPipeline: any[] = [];

        for (let i = 0; i < this.filtersChain.length; i++) {
            if (this.filtersChain[i].status == ExtensionConfigurationStatus.unsaved) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.FILTER_NOT_SAVED", params: { position: i + 1 } }, ModalType.warning);
                return;
            }

            //first element in pair: configRef
            let transfStepConfig: { extensionID: string, configRef: string } = {
                extensionID: this.filtersChain[i].selectedFactory.id,
                configRef: this.filtersChain[i].relativeReference
            };
            //second element in pair: graphs
            let transfStepGraphs: string[] = [];
            this.filtersChain[i].filterGraphs.forEach((g: GraphStruct) => {
                if (g.checked) {
                    transfStepGraphs.push(g.graph.toNT());
                }
            });

            let transfPipelineStepPair: any[] = [transfStepConfig, transfStepGraphs]; //pair [configuration, graphs]

            transformationPipeline.push(transfPipelineStepPair);
        }

        //deployerSpec
        let deployerSpec: { extensionID: string, configRef: string };
        if (this.useDeployer()) {
            if (this.deployerStatus == ExtensionConfigurationStatus.unsaved) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.DEPLOYER_NOT_SAVED" }, ModalType.warning);
                return;
            }
            deployerSpec = {
                extensionID: this.selectedDeployerExtension.id,
                configRef: this.deployerRelativeRef
            };
        }

        //reformatter (sempre in deployerSpec?)
        let reformattingExporterSpec: { extensionID: string, configRef: string };
        if (this.useReformatter()) {
            if (this.reformatterStatus == ExtensionConfigurationStatus.unsaved) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.REFORMETTER_CONFIG_NOT_SAVED" }, ModalType.warning);
                return;
            }
            reformattingExporterSpec = {
                extensionID: this.selectedReformatterExtension.id,
                configRef: this.reformatterRelativeRef
            };
        }


        let config: { [key: string]: any } = {
            graphs: graphs,
            transformationPipeline: transformationPipeline,
            includeInferred: this.includeInferred,
            deployerSpec: deployerSpec,
            reformattingExporterSpec: reformattingExporterSpec
        };

        this.sharedModals.storeConfiguration({ key: "ACTIONS.SAVE_EXPORTER_CHAIN_CONFIGURATION" }, ConfigurationComponents.EXPORTER, config).then(
            () => {
                this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.CONFIGURATION_SAVED" });
            },
            () => { }
        );
    }

    loadChain() {
        this.sharedModals.loadConfiguration({ key: "ACTIONS.LOAD_EXPORTER_CHAIN_CONFIGURATION" }, ConfigurationComponents.EXPORTER).then(
            (conf: LoadConfigurationModalReturnData) => {
                this.filtersChain = []; //reset the chain
                let configurations: STProperties[] = conf.configuration.properties;

                let deployerSpec: { extensionID: string, configRef: string };
                let reformattingExporterSpec: { extensionID: string, configRef: string };

                for (let i = 0; i < configurations.length; i++) {
                    if (configurations[i].name == "transformationPipeline") {
                        //value of a stored transformationPipeline (see loadConfiguration response)
                        let chain: [{ extensionID: string, configRef: string }, string[]][] = configurations[i].value;

                        if (chain.length > 0) {
                            //for each element of the pipeline append a filter (so that a ExtensionConfiguratorComponent is instantiated for each one of them)
                            chain.forEach(() => {
                                this.appendFilter();
                            });

                            //...and force a configuration
                            //wait that the ExtensionConfiguratorComponent for the new appended transformers are initialized
                            this.changeDetectorRef.detectChanges();
                            /**
                             * collect the ExtensionConfiguratorComponent for the transformators. This is necessary since
                             * there are also the ExtensionConfiguratorComponent for deployer and serializer, so I need to ensure
                             * that the configuration is forced to the ExtensionConfiguratorComponent of the transformators
                             */
                            let tranformerConfigurators: ExtensionConfiguratorComponent[] = [];
                            //consider just the first step of the stored pipeline and iterate over all the ExtensionConfiguratorComponent
                            let firstTransformerExtId = chain[0][0].extensionID;
                            let extConfigurators: ExtensionConfiguratorComponent[] = this.viewChildrenExtConfig.toArray();
                            extConfigurators.forEach(extConfComp => {
                                extConfComp.extensions.forEach(ext => {
                                    if (ext.id == firstTransformerExtId) {
                                        tranformerConfigurators.push(extConfComp);
                                    }
                                });
                            });
                            //now iterate over the step of the stored pipeline and force the config of the tranformerConfigurators
                            chain.forEach((c: [{ extensionID: string, configRef: string }, string[]], index: number) => {
                                let extConfPair = c[0];
                                tranformerConfigurators[index].forceConfigurationByRef(extConfPair.extensionID, extConfPair.configRef);

                                let graphs = c[1];
                                //check all the graphs in the graphs parameter
                                this.filtersChain[index].filterGraphs.forEach((fg: GraphStruct) => {
                                    fg.checked = graphs.indexOf(fg.graph.toNT()) != -1;
                                });
                            });
                        }
                    } else if (configurations[i].name == "graphs") {
                        let graphs: string[] = configurations[i].value;
                        this.exportGraphs.forEach((gs: GraphStruct) => {
                            gs.checked = graphs.indexOf(gs.graph.toNT()) != -1;
                        });
                    } else if (configurations[i].name == "includeInferred") {
                        this.includeInferred = configurations[i].value;
                    } else if (configurations[i].name == "deployerSpec") {
                        deployerSpec = configurations[i].value;
                    } else if (configurations[i].name == "reformattingExporterSpec") {
                        reformattingExporterSpec = configurations[i].value;
                    }
                }

                /**
                 * Restore the deployment: deployer + reformatter
                 */
                if (deployerSpec != null && reformattingExporterSpec != null) { //both deployer and reformatter provided => stream-sourced deployment
                    this.deploymentOptions.forEach(opt => {
                        if (opt.source == DeploySource.stream) {
                            this.selectedDeployment = opt;
                        }
                    });
                    //restore the reformatter configuration and the (stream-sourced) deployer configuration
                    this.changeDetectorRef.detectChanges(); //let the UI update after the selection of the deployment
                    this.reformatterConfigurator.forceConfigurationByRef(reformattingExporterSpec.extensionID, reformattingExporterSpec.configRef);
                    this.deployerConfigurator.forceConfigurationByRef(deployerSpec.extensionID, deployerSpec.configRef);
                } else if (deployerSpec != null) { //only deployer specified => repository-sourced deployment
                    this.deploymentOptions.forEach(opt => {
                        if (opt.source == DeploySource.repository) {
                            this.selectedDeployment = opt;
                        }
                    });
                    //restore the (repository-sourced) deployer configuration
                    this.changeDetectorRef.detectChanges();
                    this.deployerConfigurator.forceConfigurationByRef(deployerSpec.extensionID, deployerSpec.configRef);
                } else if (reformattingExporterSpec != null) { //only reformatter specified => no source for deployment
                    this.deploymentOptions.forEach(opt => {
                        if (opt.source == null) {
                            this.selectedDeployment = opt;
                        }
                    });
                    this.changeDetectorRef.detectChanges(); //needed in order to let the UI update after the selection of the deployment
                    this.reformatterConfigurator.forceConfigurationByRef(reformattingExporterSpec.extensionID, reformattingExporterSpec.configRef);
                }

            },
            () => { }
        );
    }

    /*
     * Currently the export function allows only to export in the available formats. It doesn't provide the same
     * capabilities of the export in VB2.x.x (export only a scheme, a subtree of a concept, ...) 
     * since VB3 uses the export service of SemanticTurkey. 
     */
    export() {
        //check if every filter has been configured
        for (let i = 0; i < this.filtersChain.length; i++) {
            if (this.requireConfiguration(this.filtersChain[i])) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.EXPORT_FILTER_NOT_CONFIGURED", params: { filterName: this.filtersChain[i].selectedFactory.name } },
                    ModalType.warning);
                return;
            }
        }

        //graphsToExport
        let graphsToExport: ARTURIResource[] = [];
        for (let i = 0; i < this.exportGraphs.length; i++) {
            if (this.exportGraphs[i].checked) {
                graphsToExport.push(this.exportGraphs[i].graph);
            }
        }

        //filteringPipeline
        let filteringPipeline: TransformationStep[] = [];
        for (let i = 0; i < this.filtersChain.length; i++) {
            filteringPipeline.push(this.filtersChain[i].convertToFilteringPipelineStep());
        }

        //reformattingExporterSpec && outputFormat
        let reformattingExporterSpec: PluginSpecification;
        let outputFormat: string;
        //if doesn't use a deployer or use a deployer with stream source
        if (this.selectedDeployment.source == null || this.selectedDeployment.source == DeploySource.stream) {
            reformattingExporterSpec = {
                factoryId: this.selectedReformatterExtension.id
            };
            if (this.selectedReformatterConfig != null) {
                if (this.requireConfigurationFormatter()) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.REFORMATTING_EXPORTER_NOT_CONFIGURED", params: { exporterName: this.selectedReformatterConfig.shortName } },
                        ModalType.warning);
                    return;
                }
                reformattingExporterSpec.configType = this.selectedReformatterConfig.type;
                reformattingExporterSpec.configuration = this.selectedReformatterConfig.getPropertiesAsMap();
            }

            outputFormat = this.selectedExportFormat.name;
        }

        //deployerSpec
        let deployerSpec: PluginSpecification;
        if (this.selectedDeployment.source != null) {
            deployerSpec = {
                factoryId: this.selectedDeployerExtension.id
            };
            if (this.selectedDeployerConfig != null) {
                if (this.requireConfigurationDeployer()) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.DEPLOYER_NOT_CONFIGURED" }, ModalType.warning);
                    return;
                }
                deployerSpec.configType = this.selectedDeployerConfig.type;
                deployerSpec.configuration = this.selectedDeployerConfig.getPropertiesAsMap();
            }
        }

        this.exportImpl(graphsToExport, filteringPipeline, reformattingExporterSpec, deployerSpec, outputFormat);
    }

    private exportImpl(graphsToExport: ARTURIResource[], filteringPipeline: TransformationStep[], 
        reformattingExporterSpec: PluginSpecification, deployerSpec: PluginSpecification, outputFormat: string) {
            
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.exportService.export(graphsToExport, JSON.stringify(filteringPipeline), reformattingExporterSpec, deployerSpec,
            this.includeInferred, outputFormat).pipe(
                finalize(() => { UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen); })
            ).subscribe(
                (data: any | Blob) => {
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                    this.exportSuccessHandler(data, deployerSpec == null);
                },
                (err: STError) => {
                    if (err.name.endsWith("NullGraphNotExportedException") || err.name.endsWith("UnnamedGraphNotExportedException")) {
                        let msg = err.message;
                        msg += ". " + this.translateService.instant("MESSAGES.FORCE_OPERATION_CONFIRM");
                        this.basicModals.confirm({ key: "STATUS.WARNING" }, msg, ModalType.warning).then(
                            yes => {
                                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                                this.exportService.export(graphsToExport, JSON.stringify(filteringPipeline), reformattingExporterSpec, deployerSpec,
                                    this.includeInferred, outputFormat, true).subscribe(
                                        (data: any | Blob) => {
                                            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                            this.exportSuccessHandler(data, deployerSpec == null);
                                        },
                                    );
                            },
                            no => { }
                        );
                    } else if (err.name.endsWith("ReformattingWrongModelException") || err.name.endsWith("ReformattingWrongModelException")) {
                        this.basicModals.alert({ key: "STATUS.WARNING" }, err.message, ModalType.warning);
                    } else if (err.name.endsWith("OntoPortalConstraintsViolationException")) {
                        let ontoPortalEx: OntoPortalConstraintsViolationException = err.stResp;
                        for (let v of ontoPortalEx.violations) {
                            let options: string[] = v.fixes.map(f => f.message);
                            this.basicModals.select({ key: "STATUS.WARNING" }, v.message, options, ModalType.warning).then(
                                (chosenOpt) => {
                                    let chosenFix: Repair = v.fixes.find(f => f.message == chosenOpt);
                                    let pluginSpec = chosenFix.transformerSpecification;
                                    this.applyOntoPortalFix(pluginSpec, filteringPipeline);
                                    // this.exportImpl(graphsToExport, filteringPipeline, reformattingExporterSpec, deployerSpec, includeInferred, outputFormat);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
    }

    private applyOntoPortalFix(pluginSpec: PluginSpecification, filteringPipeline: TransformationStep[]) {
        // let filterStep: TransformationStep = { 
        //     filter: {
        //         factoryId: pluginSpec.factoryId,
        //         configuration: pluginSpec.configuration
        //     }
        // };
        // filteringPipeline.push(filterStep);

        this.appendFilter();
        this.changeDetectorRef.detectChanges(); //wait the extention-configurator component to be initialized
        let extConfigurators: ExtensionConfiguratorComponent[] = this.viewChildrenExtConfig.toArray();
        /* 
        get the just added transformer. 
        In order to this gets the last element in viewChildrenExtConfig which is not the one for reformatter or deployer which are also them ExtensionConfiguratorComponent
        */
        let transformerExtConfigurator: ExtensionConfiguratorComponent[] = extConfigurators.filter(c => c != this.deployerConfigurator && c != this.reformatterConfigurator);
        let lastTransformer = transformerExtConfigurator[transformerExtConfigurator.length - 1]; //the last one
        //select the ext and the config specified in the fix
        lastTransformer.selectExtensionAndConfiguration(pluginSpec.factoryId, pluginSpec.configuration['@type']);

        this.changeDetectorRef.detectChanges(); //wait the extention-configurator to update the selectedConfiguration in the filtersChain 
        this.filtersChain[this.filtersChain.length-1].selectedConfiguration.properties.forEach(p => {
            if (p.name in pluginSpec.properties) {
                p.value = pluginSpec.properties[p.name];
            }
        });
    }

    /**
     * Handler of the export service. The export service returns a blob (file to download) or a json response 
     * depending on the usage of a deployer. Allows to download a file or show an alert after the deploy.
     * 
     * @param data 
     * @param downloadExpected 
     */
    private exportSuccessHandler(data: any | Blob, downloadExpected: boolean) {
        if (downloadExpected) {

            let ext = this.selectedExportFormat.defaultFileExtension;
            if (this.selectedExportFormat.name == "XLSX") {
                ext = "xlsx";
            }
            FileSaver.saveAs(data, "export." + ext);
        } else {
            this.basicModals.alert({ key: "ACTIONS.EXPORT_DATA" }, { key: "MESSAGES.EXPORT_RESULT_DEPLOYED" });
        }
    }

    /** =====================================
     * ============= UTILS ==================
     * =====================================*/

    private collectCheckedGraphStructures(): GraphStruct[] {
        let graphs: GraphStruct[] = [];
        if (this.areAllGraphDeselected()) {
            for (let i = 0; i < this.exportGraphs.length; i++) {
                graphs.push({ checked: false, graph: this.exportGraphs[i].graph });
            }
        } else {
            for (let i = 0; i < this.exportGraphs.length; i++) {
                if (this.exportGraphs[i].checked) {
                    graphs.push({ checked: false, graph: this.exportGraphs[i].graph });
                }
            }
        }
        return graphs;
    }

}


//Utility model classes

class GraphStruct {
    public checked: boolean;
    public graph: ARTURIResource;
    constructor(checked: boolean, graph: ARTURIResource) {
        this.checked = checked;
        this.graph = graph;
    }
}

class TransformerChainElement {
    public availableFactories: ConfigurableExtensionFactory[];
    public selectedFactory: ConfigurableExtensionFactory;
    public selectedConfiguration: Settings;
    public filterGraphs: GraphStruct[];
    public status: ExtensionConfigurationStatus;
    public relativeReference: string;

    constructor(availableFactories: ConfigurableExtensionFactory[], filterGraphs: GraphStruct[]) {
        //clone the available factories, so changing the configuration of one of them, doesn't change the default of the others
        let availableFactClone: ConfigurableExtensionFactory[] = [];
        for (let i = 0; i < availableFactories.length; i++) {
            availableFactClone.push(availableFactories[i].clone());
        }
        this.availableFactories = availableFactClone;
        this.filterGraphs = filterGraphs;
    }

    convertToFilteringPipelineStep(): TransformationStep {
        let filterStep: TransformationStep = { filter: null };
        //filter: factoryId and properties
        let filter: { factoryId: string, configuration: any } = {
            factoryId: this.selectedFactory.id,
            configuration: null
        };
        let selectedConf: Settings = this.selectedConfiguration;

        filter.configuration = selectedConf.getPropertiesAsMap();
        filterStep.filter = filter;
        //graphs to which apply the filter
        let graphs: string[] = [];
        let fg: GraphStruct[] = this.filterGraphs;
        for (let j = 0; j < fg.length; j++) {
            if (fg[j].checked) { //collect only the checked graphs
                graphs.push(fg[j].graph.getURI());
            }
        }
        if (graphs.length > 0) {
            filterStep.graphs = graphs;
        }
        return filterStep;
    }

}

interface OntoPortalConstraintsViolationException {
    exception: string;
    msg: string;
    request: string;
    stackTrace: string;
    type: string;
    violations: Violation[];
}

interface Violation {
    message: string;
    fixes: Repair[];
}

interface Repair {
    message: string;
    transformerSpecification: PluginSpecification;
}