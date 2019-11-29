import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ExportServices } from "../services/exportServices";
import { ExtensionsServices } from "../services/extensionsServices";
import { SparqlServices } from "../services/sparqlServices";
import { RDFFormat } from "../models/RDFFormat";
import { Settings, ExtensionPointID, ExtensionFactory, TransformationStep, ConfigurableExtensionFactory } from "../models/Plugins";
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
    private filters: ConfigurableExtensionFactory[];
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
                this.filters = <ConfigurableExtensionFactory[]>extensions;
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
                        + this.filtersChain[i].selectedFactory.id + ") needs to be configured", "warning");
                    return;
                }
            }
            var filteringPipeline: any[] = [];
            for (var i = 0; i < this.filtersChain.length; i++) {
                filteringPipeline.push(this.filtersChain[i].convertToFilteringPipelineStep());
            }
            filteringPipelineParam = JSON.stringify(filteringPipeline);
        }
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
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
        this.filtersChain.push(new FilterChainElement(this.filters));
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

    private configureFilter(filterChainEl: FilterChainElement) {
        var selectedConfiguration: Settings = filterChainEl.selectedConfiguration;
        this.sharedModals.configurePlugin(selectedConfiguration).then(
            (filterCfg: any) => {
                //update the selected configuration...
                filterChainEl.selectedConfiguration = filterCfg;
                //...and the configuration among the availables
                var configs: Settings[] = filterChainEl.selectedFactory.configurations;
                for (var i = 0; i < configs.length; i++) {
                    if (configs[i].shortName == filterChainEl.selectedConfiguration.shortName) {
                        configs[i] = filterChainEl.selectedConfiguration;
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
        var conf: Settings = filterChainEl.selectedConfiguration;
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
    private retrievePluginConfigurations(filterChainEl: FilterChainElement, pluginFactoryID: string): Settings[] {
        for (var i = 0; i < filterChainEl.availableFactories.length; i++) { //look for the selected PluginConfiguration among the availables
            if (filterChainEl.availableFactories[i].id == pluginFactoryID) {
                return filterChainEl.availableFactories[i].configurations;
            }
        }
    }

}


//Utility model classes

class FilterChainElement {
    public availableFactories: ConfigurableExtensionFactory[];
    public selectedFactory: ConfigurableExtensionFactory;
    public selectedConfiguration: Settings;

    constructor(availableFactories: ConfigurableExtensionFactory[]) {
        //clone the available factories, so changing the configuration of one of them, doesn't change the default of the others
        let availableFactClone: ConfigurableExtensionFactory[] = [];
        for (var i = 0; i < availableFactories.length; i++) {
            availableFactClone.push(availableFactories[i].clone());
        }
        this.availableFactories = availableFactClone;
    }

    convertToFilteringPipelineStep(): TransformationStep {
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