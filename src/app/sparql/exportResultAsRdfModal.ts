import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ExportServices } from "../services/exportServices";
import { ExtensionsServices } from "../services/extensionsServices";
import { SparqlServices } from "../services/sparqlServices";
import { RDFFormat } from "../models/RDFFormat";
import { PluginConfiguration, ExtensionPointID, ExtensionFactory, FilteringStep } from "../models/Plugins";
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
    private filters: ExtensionFactory[];
    private filtersChain: FilterChainElement[] = [];
    private selectedFilterChainElement: FilterChainElement;

    constructor(public dialog: DialogRef<ExportResultAsRdfModalData>, 
        private exportService: ExportServices, private extensionServices: ExtensionsServices, private sparqlService: SparqlServices,
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

        this.extensionServices.getExtensions(ExtensionPointID.RDF_TRANSFORMERS_ID).subscribe(
            extensions => {
                this.filters = extensions;
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
                        + this.filtersChain[i].selectedFactory.factory.id + ") needs to be configured", "warning");
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
        // this.pluginService.getPluginConfigurations(this.availableExporterFilterPlugins[0].factoryID).subscribe(
        //     configs => {
        //         var configurations: PluginConfiguration[] = configs.configurations;
        //         let pluginStructs: PluginStructure[] = [];
        //         for (var i = 0; i < this.availableExporterFilterPlugins.length; i++) {
        //             //initialize configuration only for the first (i = 0) plugin that is the selected by default
        //             //the other plugins configurations will be initialized once they are selected
        //             if (i == 0) {
        //                 pluginStructs.push(new PluginStructure(this.availableExporterFilterPlugins[i], configurations, configurations[0]));
        //             } else {
        //                 pluginStructs.push(new PluginStructure(this.availableExporterFilterPlugins[i], null, null));
        //             }
        //         }
        //         this.filtersChain.push(new FilterChainElement(pluginStructs, pluginStructs[0]));
        //     }
        // )
        let extensionStructs: ExtensionFactStructure[] = [];
        for (var i = 0; i < this.filters.length; i++) {
            extensionStructs.push(new ExtensionFactStructure(this.filters[i], this.filters[i].configurations, this.filters[i].configurations[0]));
        }
        this.filtersChain.push(new FilterChainElement(extensionStructs, extensionStructs[0]));
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
        var selectedFactory = filterChainEl.selectedFactory; //exporter selected

        // //if there isn't a configuration, call getPluginConfigurations and initialize the configuration in the given filter
        // var selectedPlugin = filterChainEl.selectedPlugin; //exporter selected
        // var configurations: PluginConfiguration[] = this.retrievePluginConfigurations(filterChainEl, selectedPlugin.plugin.factoryID);
        // if (configurations == null) { //not yet initialized
        //     this.pluginService.getPluginConfigurations(selectedPlugin.plugin.factoryID).subscribe(
        //         configs => {
        //             selectedPlugin.configurations = configs.configurations;
        //             filterChainEl.selectedPlugin.selectedConfiguration = configs.configurations[0]; //set the first as selected
        //         }
        //     )
        // }
    }

    private configureFilter(filterChainEl: FilterChainElement) {
        var selectedConfiguration: PluginConfiguration = filterChainEl.selectedFactory.selectedConfiguration;
        this.sharedModals.configurePlugin(selectedConfiguration).then(
            (filterCfg: any) => {
                //update the selected configuration...
                filterChainEl.selectedFactory.selectedConfiguration = filterCfg;
                //...and the configuration among the availables
                var configs: PluginConfiguration[] = filterChainEl.selectedFactory.configurations;
                for (var i = 0; i < configs.length; i++) {
                    if (configs[i].shortName == filterChainEl.selectedFactory.selectedConfiguration.shortName) {
                        configs[i] = filterChainEl.selectedFactory.selectedConfiguration;
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
        var conf: PluginConfiguration = filterChainEl.selectedFactory.selectedConfiguration;
        if (conf != null && conf.requireConfiguration()) { //!= null required because selectedConfiguration could be not yet initialized
            return true;
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
        for (var i = 0; i < filterChainEl.availableFactories.length; i++) { //look for the selected PluginConfiguration among the availables
            if (filterChainEl.availableFactories[i].factory.id == pluginFactoryID) {
                return filterChainEl.availableFactories[i].configurations;
            }
        }
    }

}


//Utility model classes
class ExtensionFactStructure {
    public factory: ExtensionFactory;
    public configurations: PluginConfiguration[];
    public selectedConfiguration: PluginConfiguration; //selected configuration of the selected plugin

    constructor(factory: ExtensionFactory, configurations: PluginConfiguration[], selectedConfig: PluginConfiguration) {
        this.factory = factory;
        this.configurations = configurations;
        this.selectedConfiguration = selectedConfig;
    }
}

class FilterChainElement {
    public availableFactories: ExtensionFactStructure[];
    public selectedFactory: ExtensionFactStructure;

    constructor(availableFactories: ExtensionFactStructure[], selectedFactory: ExtensionFactStructure) {
        this.availableFactories = availableFactories;
        this.selectedFactory = selectedFactory;
    }

    convertToFilteringPipelineStep(): FilteringStep {
        let filterStep: FilteringStep = {filter: null};
        //filter: factoryId and properties
        var filter: {factoryId: string, configuration: any} = {
            factoryId: this.selectedFactory.factory.id,
            configuration: null
        }
        filter.configuration = this.selectedFactory.selectedConfiguration.getPropertiesAsMap();
        filterStep.filter = filter;
        return filterStep;
    }
}