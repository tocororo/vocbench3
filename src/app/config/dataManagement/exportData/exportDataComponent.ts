import { Component, QueryList, ViewChildren } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../../../models/ARTResources";
import { ConfigurationComponents } from "../../../models/Configuration";
import { ConfigurableExtensionFactory, ExtensionConfigurationStatus, ExtensionPointID, FilteringStep, Settings, SettingsProp } from "../../../models/Plugins";
import { RDFFormat } from "../../../models/RDFFormat";
import { ExportServices } from "../../../services/exportServices";
import { ExtensionsServices } from "../../../services/extensionsServices";
import { UIUtils } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";
import { ExtensionConfiguratorComponent } from "../../../widget/extensionConfigurator/extensionConfiguratorComponent";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { FilterGraphsModal, FilterGraphsModalData } from "./filterGraphsModal/filterGraphsModal";

@Component({
    selector: "export-data-component",
    templateUrl: "./exportDataComponent.html",
    host: { class: "pageComponent" }
})
export class ExportDataComponent {

    //ExtensionConfiguratorComponent children of this Component (useful to load single configurations of a chain)
    @ViewChildren(ExtensionConfiguratorComponent) viewChildrenExtConfig: QueryList<ExtensionConfiguratorComponent>;

    //export format selection
    private exportFormats: RDFFormat[];
    private selectedExportFormat: RDFFormat;

    private includeInferred: boolean = false;

    //graph selection
    private exportGraphs: GraphStruct[] = [];

    //export filter management
    private filters: ConfigurableExtensionFactory[];
    private filtersChain: FilterChainElement[] = [];
    private selectedFilterChainElement: FilterChainElement;

    constructor(private extensionService: ExtensionsServices, private exportService: ExportServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) { }

    ngOnInit() {
        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.exportFormats = formats;
                //select RDF/XML as default
                for (var i = 0; i < this.exportFormats.length; i++) {
                    if (this.exportFormats[i].name == "RDF/XML") {
                        this.selectedExportFormat = this.exportFormats[i];
                        return;
                    }
                }
            }
        );

        let baseURI: string = VBContext.getWorkingProject().getBaseURI();
        this.exportService.getNamedGraphs().subscribe(
            graphs => {
                graphs.sort(
                    function(g1: ARTURIResource, g2: ARTURIResource) {
                        return g1.getURI().localeCompare(g2.getURI());
                    }
                );
                for (var i = 0; i < graphs.length; i++) {
                    this.exportGraphs.push(new GraphStruct(graphs[i].getURI() == baseURI, graphs[i])); //set checked the project baseURI
                }
            }
        );

        this.extensionService.getExtensions(ExtensionPointID.RDF_TRANSFORMERS_ID).subscribe(
            extensions => {
                this.filters = <ConfigurableExtensionFactory[]>extensions;
            }
        );
    }

    /** =====================================
     * ============= GRAPHS =================
     * =====================================*/
    private areAllGraphDeselected(): boolean {
        for (var i = 0; i < this.exportGraphs.length; i++) {
            if (this.exportGraphs[i].checked) {
                return false;
            }
        }
        return true;
    }

    /**
     * When a graph is included/excluded from the export, update the graph selection of the filters
     */
    private onGraphSelectionChange(graphStruct: GraphStruct) {
        // if the graph is now selected, add it (as not selected since it was not included before) to the graphs selection of the filters
        if (graphStruct.checked) {
            if (this.collectCheckedGraphStructures().length == 1) {
                //if the current graphStruct is the only one selected means that previously every graph was unchecked,
                //so the filterChain element had all the graphs in the filterGraphs array.
                //In this case, now the filterGraphs array should contains only the just checked graph
                for (var i = 0; i < this.filtersChain.length; i++) {
                    this.filtersChain[i].filterGraphs = [new GraphStruct(false, graphStruct.graph)];
                }
            } else {
                for (var i = 0; i < this.filtersChain.length; i++) {
                    this.filtersChain[i].filterGraphs.push(new GraphStruct(false, graphStruct.graph));
                }
            }
        } else {//graph is now unselected
            //if now no graph is selected, add them all to the filterGraphs array of the filterChain elements
            if (this.areAllGraphDeselected()) {
                for (var i = 0; i < this.filtersChain.length; i++) {
                    this.filtersChain[i].filterGraphs = this.collectCheckedGraphStructures();
                }
            } else {
                //remove it from the graphs selection of the filters
                for (var i = 0; i < this.filtersChain.length; i++) {
                    var fg: GraphStruct[] = this.filtersChain[i].filterGraphs;
                    for (var j = 0; j < fg.length; j++) {
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
    private selectFilterChainElement(filterChainEl: FilterChainElement) {
        if (this.selectedFilterChainElement == filterChainEl) {
            this.selectedFilterChainElement = null;
        } else {
            this.selectedFilterChainElement = filterChainEl;
        }
    }
    private isSelectedFilterFirst(): boolean {
        return (this.selectedFilterChainElement == this.filtersChain[0]);
    }
    private isSelectedFilterLast(): boolean {
        return (this.selectedFilterChainElement == this.filtersChain[this.filtersChain.length - 1]);
    }

    private appendFilter() {
        this.filtersChain.push(new FilterChainElement(this.filters, this.collectCheckedGraphStructures()));
    }
    private removeFilter() {
        this.filtersChain.splice(this.filtersChain.indexOf(this.selectedFilterChainElement), 1);
        this.selectedFilterChainElement = null;
    }
    private moveFilterDown() {
        var prevIndex = this.filtersChain.indexOf(this.selectedFilterChainElement);
        this.filtersChain.splice(prevIndex, 1); //remove from current position
        this.filtersChain.splice(prevIndex + 1, 0, this.selectedFilterChainElement);
    }
    private moveFilterUp() {
        var prevIndex = this.filtersChain.indexOf(this.selectedFilterChainElement);
        this.filtersChain.splice(prevIndex, 1); //remove from current position
        this.filtersChain.splice(prevIndex - 1, 0, this.selectedFilterChainElement);
    }

    private onExtensionUpdated(filterChainEl: FilterChainElement, ext: ConfigurableExtensionFactory) {
        filterChainEl.selectedFactory = ext;
    }
    private onConfigurationUpdated(filterChainEl: FilterChainElement, config: Settings) {
        filterChainEl.selectedConfiguration = config;
    }

    private onConfigStatusUpdated(filterChainEl: FilterChainElement, statusEvent: { status: ExtensionConfigurationStatus, relativeReference?: string }) {
        filterChainEl.status = statusEvent.status;
        filterChainEl.relativeReference = statusEvent.relativeReference;
    }

    private configureGraphs(filterChainEl: FilterChainElement) {
        this.openGraphSelectionModal(filterChainEl.filterGraphs).then(
            res => {},
            () => {}
        );
    }

    private openGraphSelectionModal(filterGraphs: GraphStruct[]) {
        var modalData = new FilterGraphsModalData(filterGraphs);
        const builder = new BSModalContextBuilder<FilterGraphsModalData>(
            modalData, undefined, FilterGraphsModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(FilterGraphsModal, overlayConfig).result;
    }

    /**
     * Returns true if a plugin of the filter chain require edit of the configuration and it is not configured
     */
    private requireConfiguration(filterChainEl: FilterChainElement): boolean {
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
        let graphs: string[] = [];
        for (var i = 0; i < this.exportGraphs.length; i++) {
            if (this.exportGraphs[i].checked) {
                graphs.push(this.exportGraphs[i].graph.toNT());
            }
        }

        let transformationPipeline: any[] = [];

        for (var i = 0; i < this.filtersChain.length; i++) {

            if (this.filtersChain[i].status == ExtensionConfigurationStatus.unsaved) {
                this.basicModals.alert("Unsaved configuration", "Filter at position " + (i+1) + " is not saved. " +
                    "In order to save a filter chain all its filters needs to be saved.", "warning");
                return;
            }

            //first element in pair: configRef
            let transfStepConfig: any = {
                extensionID: this.filtersChain[i].selectedFactory.id,
                // configuration: this.filtersChain[i].selectedConfiguration.getPropertiesAsMap()
                configRef: this.filtersChain[i].relativeReference
            };
            //second element in pair: graphs
            let transfStepGraphs: string[] = [];
            this.filtersChain[i].filterGraphs.forEach((g: GraphStruct) => {
                if (g.checked) {
                    transfStepGraphs.push(g.graph.toNT());
                }
            })

            let transfPipelineStepPair: any[] = [ transfStepConfig, transfStepGraphs ]; //pair [configuration, graphs]

            transformationPipeline.push(transfPipelineStepPair);
        }

        let config: { [key: string]: any } = {
            graphs: graphs,
            transformationPipeline: transformationPipeline,
            includeInferred: this.includeInferred,
            deployerSpec: null
        }

        this.sharedModals.storeConfiguration("Save exporter chain configuration", ConfigurationComponents.EXPORTER, config).then(
            () => {
                this.basicModals.alert("Save configuration", "Configuration saved succesfully");
            },
            () => {}
        );
    }

    private loadChain() {
        this.sharedModals.loadConfiguration("Load exporter chain configuration", ConfigurationComponents.EXPORTER).then(
            (conf: LoadConfigurationModalReturnData) => {
                this.filtersChain = []; //reset the chain
                let configurations: SettingsProp[] = conf.configuration.properties;
                for (var i = 0; i < configurations.length; i++) {
                    if (configurations[i].name == "transformationPipeline") {
                        //value of a stored transformationPipeline (see loadConfiguration response)
                        let chain: [{extensionID: string, configRef: string}, string[]][] = configurations[i].value;

                        //for each element of the pipeline append a filter (so that a ExtensionConfiguratorComponent is instantiated for each one of them)
                        chain.forEach(() => {
                            this.appendFilter();
                        });

                        //...and force a configuration
                        setTimeout(() => {  //wait that the ExtensionConfiguratorComponent for the new appended filters are initialized
                            chain.forEach((c : [{extensionID: string, configRef: string}, string[]], index: number) => {
                                let extConfPair = c[0];
                                let extConfigurators: ExtensionConfiguratorComponent[] = this.viewChildrenExtConfig.toArray();
                                extConfigurators[index].forceConfiguration(extConfPair.extensionID, extConfPair.configRef);

                                let graphs = c[1];
                                //check all the graphs in the graphs parameter
                                this.filtersChain[index].filterGraphs.forEach((fg: GraphStruct) => {
                                    fg.checked = graphs.indexOf(fg.graph.toNT()) != -1;
                                });
                            });
                        });
                    } else if (configurations[i].name == "graphs") {
                        let graphs: string[] = configurations[i].value;
                        this.exportGraphs.forEach((gs: GraphStruct) => {
                            gs.checked = graphs.indexOf(gs.graph.toNT()) != -1;
                        })
                    } else if (configurations[i].name == "includeInferred") {
                        this.includeInferred = configurations[i].value;
                    }
                }
            }
        );
    }

    /*
     * Currently the export function allows only to export in the available formats. It doesn't provide the same
     * capabilities of the export in VB2.x.x (export only a scheme, a subtree of a concept, ...) 
     * since VB3 uses the export service of SemanticTurkey. 
     */
    private export() {
        //check if every filter has been configured
        for (var i = 0; i < this.filtersChain.length; i++) {
            if (this.requireConfiguration(this.filtersChain[i])) {
                this.basicModals.alert("Missing filter configuration", "An export filter ("
                    + this.filtersChain[i].selectedFactory.id + ") needs to be configured", "warning");
                return;
            }
        }

        //collect all the graphs checked (to export)
        var graphsToExport: ARTURIResource[] = [];
        for (var i = 0; i < this.exportGraphs.length; i++) {
            if (this.exportGraphs[i].checked) {
                graphsToExport.push(this.exportGraphs[i].graph);
            }
        }

        var filteringPipeline: FilteringStep[] = [];
        for (var i = 0; i < this.filtersChain.length; i++) {
            filteringPipeline.push(this.filtersChain[i].convertToFilteringPipelineStep());
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.exportService.export(graphsToExport, JSON.stringify(filteringPipeline), this.includeInferred, this.selectedExportFormat).subscribe(
            blob => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink("Export data", null, exportLink, "export." + this.selectedExportFormat.defaultFileExtension);
            },
            (err: Error) => {
                if (err.name.endsWith('ExportPreconditionViolationException')) {
                    this.basicModals.confirm("Warning", err.message + " Do you want to force the export?", "warning").then(
                        yes => {
                            UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                            this.exportService.export(graphsToExport, JSON.stringify(filteringPipeline), this.includeInferred, this.selectedExportFormat, true).subscribe(
                                blob => {
                                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                    var exportLink = window.URL.createObjectURL(blob);
                                    this.basicModals.downloadLink("Export data", null, exportLink, "export." + this.selectedExportFormat.defaultFileExtension);
                                }
                            );
                        },
                        no => {}
                    );
                }
            }
        );

    }

    /** =====================================
     * ============= UTILS ==================
     * =====================================*/

    private collectCheckedGraphStructures(): GraphStruct[] {
        var graphs: GraphStruct[] = []
        if (this.areAllGraphDeselected()) {
            for (var i = 0; i < this.exportGraphs.length; i++) {
                graphs.push({checked: false, graph: this.exportGraphs[i].graph});
            }    
        } else {
            for (var i = 0; i < this.exportGraphs.length; i++) {
                if (this.exportGraphs[i].checked) {
                    graphs.push({checked: false, graph: this.exportGraphs[i].graph});
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

class FilterChainElement {
    public availableFactories: ConfigurableExtensionFactory[];
    public selectedFactory: ConfigurableExtensionFactory;
    public selectedConfiguration: Settings;
    public filterGraphs: GraphStruct[];
    public status: ExtensionConfigurationStatus;
    public relativeReference: string;

    constructor(availableFactories: ConfigurableExtensionFactory[], filterGraphs: GraphStruct[]) {
        //clone the available factories, so changing the configuration of one of them, doesn't change the default of the others
        let availableFactClone: ConfigurableExtensionFactory[] = [];
        for (var i = 0; i < availableFactories.length; i++) {
            availableFactClone.push(availableFactories[i].clone());
        }
        this.availableFactories = availableFactClone;
        this.filterGraphs = filterGraphs;
    }

    convertToFilteringPipelineStep(): FilteringStep {
        let filterStep: FilteringStep = {filter: null};
        //filter: factoryId and properties
        var filter: {factoryId: string, configuration: any} = {
            factoryId: this.selectedFactory.id,
            configuration: null
        }
        var selectedConf: Settings = this.selectedConfiguration;
        
        filter.configuration = selectedConf.getPropertiesAsMap();
        filterStep.filter = filter;
        //graphs to which apply the filter
        var graphs: string[] = [];
        var fg: GraphStruct[] = this.filterGraphs;
        for (var j = 0; j < fg.length; j++) {
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