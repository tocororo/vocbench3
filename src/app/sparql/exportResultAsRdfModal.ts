import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ExportServices } from "../services/exportServices";
import { PluginsServices } from "../services/pluginsServices";
import { SparqlServices } from "../services/sparqlServices";
import { RDFFormat } from "../models/RDFFormat";
import { PluginConfiguration, Plugin, ExtensionPoint } from "../models/Plugins";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { UIUtils } from "../utils/UIUtils";

export class ExportResultAsRdfModalData extends BSModalContext {
    constructor(public query: string, public inferred: boolean) {
        super();
    }
}

@Component({
    selector: "export-as-rdf-modal",
    templateUrl: "./exportResultAsRdfModal.html",
})
export class ExportResultAsRdfModal implements ModalComponent<ExportResultAsRdfModalData> {
    context: ExportResultAsRdfModalData;

    private exportFormats: RDFFormat[];
    private selectedExportFormat: RDFFormat;

    private applyFilter: boolean = false;

    //export filter management
    private availableExporterFilterPlugins: Plugin[];
    private filtersChain: FilterChainElement[] = [];
    private selectedFilterChainElement: FilterChainElement;

    constructor(public dialog: DialogRef<ExportResultAsRdfModalData>, 
        private exportService: ExportServices, private pluginService: PluginsServices, private sparqlService: SparqlServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

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

        this.pluginService.getAvailablePlugins(ExtensionPoint.EXPORT_FILTER_ID).subscribe(
            plugins => {
                this.availableExporterFilterPlugins = plugins;
                let filters: PluginStructure[] = [];
            }
        );
    }

    ok(event: Event) {
        let filteringPipelineParam: string;
        if (this.applyFilter) {
            //check if every filter has been configured
            for (var i = 0; i < this.filtersChain.length; i++) {
                if (this.requireConfiguration(this.filtersChain[i])) {
                    this.basicModals.alert("Missing filter configuration", "An export filter ("
                        + this.filtersChain[i].selectedPlugin.plugin.factoryID + ") need to be configured", "warning");
                    return;
                }
            }
            var filteringPipeline: any[] = [];
            for (var i = 0; i < this.filtersChain.length; i++) {
                filteringPipeline.push(this.filtersChain[i].convertToFilteringPipelineStep());
            }
            filteringPipelineParam = JSON.stringify(filteringPipeline);
        }
        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
        this.sparqlService.exportGraphQueryResultAsRdf(this.context.query, this.selectedExportFormat, this.context.inferred, filteringPipelineParam).subscribe(
            blob => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink("Export SPARQL results", null, exportLink, "sparql_export." + this.selectedExportFormat.defaultFileExtension);
            }
        );

        event.stopPropagation();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
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
                this.filtersChain.push(new FilterChainElement(pluginStructs, pluginStructs[0]));
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

export class FilterChainElement {
    public availablePlugins: PluginStructure[];
    public selectedPlugin: PluginStructure; //plugin currently selected in the <select> element

    constructor(availablePlugins: PluginStructure[], selectedPlugin: PluginStructure) {
        this.availablePlugins = availablePlugins;
        this.selectedPlugin = selectedPlugin;
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
        return filterStep;
    }
}