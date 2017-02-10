import { Component } from "@angular/core";
import { PluginsServices } from "../../../services/pluginsServices";
import { ExportServices } from "../../../services/exportServices";
import { Plugin, PluginConfiguration } from "../../../models/Plugins";
import { RDFFormat } from "../../../models/RDFFormat";
import { ARTURIResource } from "../../../models/ARTResources";

@Component({
    selector: "export-data-component",
    templateUrl: "./exportDataComponent.html",
    host: { class: "pageComponent" }
})
export class ExportDataComponent {

    private exportFormats: RDFFormat[];
    private selectedExportFormat: RDFFormat;
    
    private exportGraphs: { checked: boolean, graph: ARTURIResource }[] = [];

    private exportFilterExtPointID: string = "it.uniroma2.art.semanticturkey.plugin.extpts.ExportFilter";
    private availableExporterFilterPlugins: Plugin[];

    private filtersChain: FilterChainElement[] = [];

    private selectedFilterChainElement: FilterChainElement;

    constructor(private pluginService: PluginsServices, private exportService: ExportServices) { }

    ngOnInit() {
        this.pluginService.getAvailablePlugins(this.exportFilterExtPointID).subscribe(
            extPointPlugins => {
                this.availableExporterFilterPlugins = extPointPlugins.plugins;
                let filters: FilterStructure[] = [];
                // for (var i = 0; i < this.availableExporterFilterPlugins.length; i++) {
                //     filters.push(new FilterStructure(this.availableExporterFilterPlugins[i], null)); //empty configuration
                // }
                // this.filtersChain.push(new FilterChainElement(this.availableExporterFilterPlugins[0], filters));
            }
        );
        this.exportService.getNamedGraphs().subscribe(
            graphs => {
                for (var i = 0; i < graphs.length; i++) {
                    this.exportGraphs.push({checked: false, graph: graphs[i]});
                }
            }
        );
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
    }


    /** =====================================
     * ============= GRAPHS =================
     * =====================================*/
    private checkAllGraph() {
        for (var i = 0; i < this.exportGraphs.length; i++) {
            this.exportGraphs[i].checked = true;
        }
    }
    private uncheckAllGraph() {
        for (var i = 0; i < this.exportGraphs.length; i++) {
            this.exportGraphs[i].checked = false;
        }
    }
    private areAllGraphDeselected(): boolean {
        for (var i = 0; i < this.exportGraphs.length; i++) {
            if (this.exportGraphs[i].checked) {
                return false;
            }
        }
        return true;
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
        let filters: FilterStructure[] = [];
        for (var i = 0; i < this.availableExporterFilterPlugins.length; i++) {
            filters.push(new FilterStructure(this.availableExporterFilterPlugins[i], null));
        }
        this.filtersChain.push(new FilterChainElement(this.availableExporterFilterPlugins[0], filters));
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
    private onChangeExportFilterPlugin(filterChainEl: FilterChainElement) {
        //if there isn't a configuration, call getPluginConfigurations and initialize the configuration in the given filter
        var selectedPlugin = filterChainEl.selectedPlugin; //exporter selected
        var filterStruct: FilterStructure = this.retrieveFilterStructure(filterChainEl, filterChainEl.selectedPlugin);
        //check if the configuration is null (it would mean that config is not yet initialized)
        if (filterStruct.configurations == null) { 
            this.pluginService.getPluginConfigurations(selectedPlugin.factoryID).subscribe( //initialize configuration
                configurations => {
                    console.log("configuration", configurations);
                    filterStruct.configurations = configurations;
                }
            );
        }
    }

    
    private configureFilter(filterChainEl: FilterChainElement) {
        var selectedPlugin = filterChainEl.selectedPlugin; //exporter selected
        var filterStruct: FilterStructure = this.retrieveFilterStructure(filterChainEl, selectedPlugin);
        //check if the configuration is null (it would mean that config is not yet initialized)
        if (filterStruct.configurations == null) { 
            this.pluginService.getPluginConfigurations(selectedPlugin.factoryID).subscribe( //initialize configuration
                configurations => {
                    filterStruct.configurations = configurations;
                    this.openConfigurationFilterModal(filterChainEl); //the open the modal to configure the filter
                }
            );
        } else { //il the configuration is already initialized
            this.openConfigurationFilterModal(filterChainEl); ////open directly the modal to configure the filter
        }
    }
    /**
     * Opens a modal to choose a configuration and edit
     */
    private openConfigurationFilterModal(filterChainEl: FilterChainElement) {
        var selectedPlugin = filterChainEl.selectedPlugin; //exporter selected
        var filterStruct: FilterStructure = this.retrieveFilterStructure(filterChainEl, selectedPlugin);
        console.log("open modal to configure ", filterStruct);
    }

    /*
     * Currently the export function allows only to export in the available formats. It doesn't provide the same
     * capabilities of the export in VB2.x.x (export only a scheme, a subtree of a concept, ...) 
     * since VB3 uses the export service of SemanticTurkey. 
     */
    // private export() {
    //     document.getElementById("blockDivFullScreen").style.display = "block";
    //     this.inOutService.saveRDF(this.format).subscribe(
    //         stResp => {
    //             document.getElementById("blockDivFullScreen").style.display = "none";
    //             var data = new Blob([stResp], {type: "octet/stream"});
    //             var downloadLink = window.URL.createObjectURL(data);
    //             var fileName = "export." + RDFFormat.getFormatExtensions(this.format);
    //             this.modalService.downloadLink("Export data", null, downloadLink, fileName);
    //         },
    //         err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
    //     );
    // }

    /** =====================================
     * ============= UTILS ==================
     * =====================================*/

     /**
     * Retrieves the FilterStructure from a FilterChainElement about the given Plugin
     */
    private retrieveFilterStructure(filterChainEl: FilterChainElement, exporterFilterPlugin: Plugin): FilterStructure {
        for (var i = 0; i < filterChainEl.filters.length; i++) { //look for the FilterStructure about the selected exporter plugin
            if (filterChainEl.filters[i].plugin == exporterFilterPlugin) {
                return filterChainEl.filters[i];
            }
        }
    }

    private getFactoryIdShortName(factoryID: string) {
        return factoryID.substring(factoryID.lastIndexOf(".")+1);
    }

}

/**
 * Filter Plugins with related configuration
 */
class FilterStructure {
    public plugin: Plugin;
    public configurations: PluginConfiguration[];
    constructor(plugin: Plugin, configurations: PluginConfiguration[]) {
        this.plugin = plugin;
        this.configurations = configurations;
    }
}

class FilterChainElement {
    public selectedPlugin: Plugin; //plugin currently selected in the <select> element
    public filters: FilterStructure[]; //available filters (plugin)
    constructor(selectedPlugin: Plugin, filters: FilterStructure[]) {
        this.selectedPlugin = selectedPlugin;
        this.filters = filters;
    }
}