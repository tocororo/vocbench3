import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { PluginsServices } from "../../../services/pluginsServices";
import { ExportServices } from "../../../services/exportServices";
import { MetadataServices } from "../../../services/metadataServices";
import { Plugin, PluginConfiguration, ExtensionPoint } from "../../../models/Plugins";
import { RDFFormat } from "../../../models/RDFFormat";
import { ARTURIResource } from "../../../models/ARTResources";
import { VBContext } from "../../../utils/VBContext";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { FilterGraphsModal, FilterGraphsModalData } from "./filterGraphsModal/filterGraphsModal";

@Component({
    selector: "export-data-component",
    templateUrl: "./exportDataComponent.html",
    host: { class: "pageComponent" }
})
export class ExportDataComponent {

    //export format selection
    private exportFormats: RDFFormat[];
    private selectedExportFormat: RDFFormat;

    private includeInferred: boolean;

    //graph selection
    private exportGraphs: GraphStruct[] = [];

    //export filter management
    private availableExporterFilterPlugins: Plugin[];
    private filtersChain: FilterChainElement[] = [];
    private selectedFilterChainElement: FilterChainElement;

    constructor(private pluginService: PluginsServices, private exportService: ExportServices, private metadataService: MetadataServices,
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
        this.pluginService.getAvailablePlugins(ExtensionPoint.EXPORT_FILTER_ID).subscribe(
            plugins => {
                this.availableExporterFilterPlugins = plugins;
                let filters: PluginStructure[] = [];
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
        //if the graph is now selected, add it (as not selected since it was not included before) to the graphs selection of the filters
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
        this.pluginService.getPluginConfigurations(this.availableExporterFilterPlugins[0].factoryID).subscribe(
            configs => {
                var configurations: PluginConfiguration[] = configs.configurations;
                let pluginStructs: PluginStructure[] = [];
                for (var i = 0; i < this.availableExporterFilterPlugins.length; i++) {
                    //initialize configuration only for the first (i = 0) plugin that is the selected by default
                    //the other plugins configurations will be initialized once they are selected
                    if (i == 0) {
                        pluginStructs.push(new PluginStructure(this.availableExporterFilterPlugins[i], configurations, configurations[0]));
                    } else {
                        pluginStructs.push(new PluginStructure(this.availableExporterFilterPlugins[i], null, null));
                    }
                }
                this.filtersChain.push(new FilterChainElement(pluginStructs, pluginStructs[0], this.collectCheckedGraphStructures()));
            }
        )
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

    /**
     * Called when the user changes the exporter filter of a chain element
     */
    private onChangePlugin(filterChainEl: FilterChainElement) {
        //if there isn't a configuration, call getPluginConfigurations and initialize the configuration in the given filter
        var selectedPlugin = filterChainEl.selectedPlugin; //exporter selected
        var configurations: PluginConfiguration[] = this.retrievePluginConfigurations(filterChainEl, selectedPlugin.plugin.factoryID);
        if (configurations == null) { //not yet initialized
            this.pluginService.getPluginConfigurations(selectedPlugin.plugin.factoryID).subscribe(
                configs => {
                    selectedPlugin.configurations = configs.configurations;
                    filterChainEl.selectedPlugin.selectedConfiguration = configs.configurations[0]; //set the first as selected
                }
            )
        }
    }

    private configureFilter(filterChainEl: FilterChainElement) {
        var selectedConfiguration: PluginConfiguration = filterChainEl.selectedPlugin.selectedConfiguration;
        this.sharedModals.configurePlugin(selectedConfiguration).then(
            (filterCfg: any) => {
                //update the selected configuration...
                filterChainEl.selectedPlugin.selectedConfiguration = filterCfg;
                //...and the configuration among the availables
                var configs: PluginConfiguration[] = filterChainEl.selectedPlugin.configurations;
                for (var i = 0; i < configs.length; i++) {
                    if (configs[i].shortName == filterChainEl.selectedPlugin.selectedConfiguration.shortName) {
                        configs[i] = filterChainEl.selectedPlugin.selectedConfiguration;
                    }
                }
            },
            () => { }
        );
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
        var conf: PluginConfiguration = filterChainEl.selectedPlugin.selectedConfiguration;
        if (conf != null && conf.editRequired) { //!= null required because selectedConfiguration could be not yet initialized
            for (var i = 0; i < conf.params.length; i++) {
                if (conf.params[i].required && (conf.params[i].value == null || conf.params[i].value.trim() == "")) {
                    return true; //if at least one parameter is null => requires confiration
                }
            }
        }
        return false;
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
                    + this.filtersChain[i].selectedPlugin.plugin.factoryID + ") need to be configured", "warning");
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

        var filteringPipeline: any[] = [];
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

    /**
    * Retrieves the PluginCon from a FilterChainElement about the given Plugin
    */
    private retrievePluginConfigurations(filterChainEl: FilterChainElement, pluginFactoryID: string): PluginConfiguration[] {
        for (var i = 0; i < filterChainEl.availablePlugins.length; i++) { //look for the selected PluginConfiguration among the availables
            if (filterChainEl.availablePlugins[i].plugin.factoryID == pluginFactoryID) {
                return filterChainEl.availablePlugins[i].configurations;
            }
        }
    }

    private getFactoryIdShortName(factoryID: string) {
        return factoryID.substring(factoryID.lastIndexOf(".") + 1);
    }

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

class PluginStructure {
    public plugin: Plugin;
    public configurations: PluginConfiguration[];
    public selectedConfiguration: PluginConfiguration; //selected configuration of the selected plugin

    constructor(plugin: Plugin, configurations: PluginConfiguration[], selectedConfig: PluginConfiguration) {
        this.plugin = plugin;
        this.configurations = configurations;
        this.selectedConfiguration = selectedConfig;
    }
}

class GraphStruct {
    public checked: boolean;
    public graph: ARTURIResource;
    constructor(checked: boolean, graph: ARTURIResource) {
        this.checked = checked;
        this.graph = graph;
    }
}

export class FilterChainElement {
    public availablePlugins: PluginStructure[];
    public selectedPlugin: PluginStructure; //plugin currently selected in the <select> element
    public filterGraphs: GraphStruct[];

    constructor(availablePlugins: PluginStructure[], selectedPlugin: PluginStructure, filterGraphs: GraphStruct[]) {
        this.availablePlugins = availablePlugins;
        this.selectedPlugin = selectedPlugin;
        this.filterGraphs = filterGraphs;
    }

    convertToFilteringPipelineStep(): {filter: {factoryId: string, properties: any}, graphs?: string[]} {
        let filterStep: {filter: {factoryId: string, properties: any}, graphs?: string[]} = {filter: null};
        //filter: factoryId and properties
        var filter: {factoryId: string, properties: any} = {
            factoryId: this.selectedPlugin.plugin.factoryID,
            properties: null
        }
        var filterProps: any = {};
        var selectedConf: PluginConfiguration = this.selectedPlugin.selectedConfiguration;
        for (var j = 0; j < selectedConf.params.length; j++) {
            filterProps[selectedConf.params[j].name] = selectedConf.params[j].value;
        }
        filter.properties = filterProps;
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