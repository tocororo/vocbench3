import { Component, ViewChild } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTBNode, ARTNode, ARTResource, ARTURIResource } from "../models/ARTResources";
import { Configuration, ConfigurationComponents, ConfigurationProperty } from "../models/Configuration";
import { PrefixMapping } from "../models/Metadata";
import { SettingsProp } from "../models/Plugins";
import { QueryMode, ResultType, VariableBindings } from "../models/Sparql";
import { ConfigurationsServices } from "../services/configurationsServices";
import { ExportServices } from "../services/exportServices";
import { SearchServices } from "../services/searchServices";
import { SparqlServices } from "../services/sparqlServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { UIUtils } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { LoadConfigurationModalReturnData } from "../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from '../widget/modal/sharedModal/sharedModalServices';
import { ExportResultAsRdfModal, ExportResultAsRdfModalData } from "./exportResultAsRdfModal";
import { QueryParameterizationMgrModal, QueryParameterizationMgrModalReturnData } from "./queryParameterization/queryParameterizationMgrModal";
import { YasguiComponent } from "./yasguiComponent";

@Component({
    selector: "sparql-tab",
    templateUrl: "./sparqlTabComponent.html"
})
export class SparqlTabComponent {

    @ViewChild(YasguiComponent) viewChildYasgui: YasguiComponent;

    private sampleQuery: string = "SELECT * WHERE {\n    ?s ?p ?o .\n} LIMIT 10";

    private query: string;
    private queryMode: QueryMode = QueryMode.query;
    private queryCache: string; //contains the last query submitted (useful to invoke the export excel)
    private respSparqlJSON: any; //keep the "sparql" JSON object contained in the response
    private resultType: ResultType;
    private headers: string[];
    private queryResult: any;
    private queryInProgress: boolean = false;
    private queryValid: boolean = true;
    private queryTime: string;
    private inferred: boolean = false;

    //parameterization
    private variableBindings: VariableBindings[];
    private bindings: Map<string, ARTNode>;
    private useBindings: boolean = true;

    //result paging
    private resultsPage: number = 0;
    private resultsTotPage: number = 0;
    private resultsLimit: number = 100;


    constructor(private sparqlService: SparqlServices, private exportService: ExportServices, private configurationsService: ConfigurationsServices,
        private searchService: SearchServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) { }

    ngOnInit() {
        //collect the prefix namespace mappings
        var mappings: PrefixMapping[] = VBContext.getPrefixMappings();
        var prefixImports: string = "";
        for (var i = 0; i < mappings.length; i++) {
            prefixImports += "PREFIX " + mappings[i].prefix + ": <" + mappings[i].namespace + ">\n";
        }
        //set them as suffix of sampleQuery
        this.sampleQuery = prefixImports + "\n" + this.sampleQuery;

        this.query = this.sampleQuery;
    }

    private doQuery() {
        var initTime = new Date().getTime();
        this.queryResult = null;
        this.resultsPage = 0;
        this.resultsTotPage = 0;
        this.queryCache = this.query; //stored the submitted query

        let bindingsParam: Map<string, ARTNode>;
        if (this.useBindings) {
            bindingsParam = this.bindings;
        }

        if (this.queryMode == QueryMode.query) {
            if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SPARQL_EVALUATE_QUERY)) {
                this.basicModals.alert("Operation denied", "You are not authorized to perform SPARQL query");
                return;
            }
            UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
            this.sparqlService.evaluateQuery(this.query, this.inferred, null, bindingsParam).subscribe(
                stResp => {
                    this.sparqlResponseHandler(stResp, initTime);
                }
            );
        } else { //queryMode "update"
            if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SPARQL_EXECUTE_UPDATE)) {
                this.basicModals.alert("Operation denied", "You are not authorized to perform SPARQL update");
                return;
            }
            UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
            this.sparqlService.executeUpdate(this.query, this.inferred, null, bindingsParam).subscribe(
                stResp => {
                    this.sparqlResponseHandler(stResp, initTime);
                }
            );
        }
    }

    private sparqlResponseHandler(stResp: any, initTime: number) {
        this.respSparqlJSON = stResp.sparql;
        //calculates the time spent in query
        var finishTime = new Date().getTime();
        var diffTime = finishTime - initTime;
        this.queryTime = this.getPrettyPrintTime(diffTime);
        //process result
        this.resultType = stResp.resultType;
        if (stResp.resultType == ResultType.tuple || stResp.resultType == ResultType.graph) {
            this.headers = stResp.sparql.head.vars;
            this.queryResult = stResp.sparql.results.bindings;
            //paging handler
            this.resultsTotPage = Math.floor(this.queryResult.length / this.resultsLimit);
            if (this.queryResult.length % this.resultsLimit > 0) {
                this.resultsTotPage++;
            }
        } else if (stResp.resultType == ResultType.boolean) {
            this.headers = ["boolean"];
            this.queryResult = Boolean(stResp.sparql.boolean);
        }
        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
    }

    /**
     * Listener of event querychange, emitted from YasquiComponent.
     * Event is an object {query: string, valid: boolean, mode} where
     * query is the code written in the textarea
     * valid tells wheter the query is syntactically correct
     * mode tells the query mode (query/update) 
     */
    private onQueryChange(event: any) {
        this.query = event.query;
        this.queryValid = event.valid;
        this.queryMode = event.mode;
    }

    private clear() {
        this.respSparqlJSON = null;
        this.headers = null;
        this.queryResult = null;
        this.queryTime = null;
        this.resultsPage = 0;
        this.resultsTotPage = 0;
    }

    private exportAsJSON() {
        this.downloadSavedResult(JSON.stringify(this.respSparqlJSON), "json");
    }

    private exportAsCSV() {
        //https://www.w3.org/TR/sparql11-results-csv-tsv/#csv
        var serialization = "";
        var separator = ",";

        if (this.resultType == ResultType.tuple || this.resultType == ResultType.graph) {
            //headers
            var headers = this.headers;
            for (var i = 0; i < headers.length; i++) {
                serialization += headers[i] + separator;
            }
            serialization = serialization.slice(0, -1); //remove last separator
            serialization += "\n"; //and add new line
            //results
            var res: Array<any> = this.queryResult;
            for (var j = 0; j < res.length; j++) {
                for (var i = 0; i < headers.length; i++) {
                    if (res[j][headers[i]] != undefined) {
                        serialization += this.escapeForCSV(res[j][headers[i]]) + separator;
                    } else {
                        serialization += separator;
                    }
                }
                serialization = serialization.slice(0, -1); //remove last separator
                serialization += "\n"; //and add new line
            }
        } else if (this.resultType == ResultType.boolean) {
            serialization += "result\n" + this.queryResult;
        }

        this.downloadSavedResult(serialization, "csv");
    }

    /**
     * Field is an object {value, type} like the bindings in the sparql response of tuple query
     */
    private escapeForCSV(field: any): string {
        var value: string = field.value;
        /* Fields containing any of 
        " (QUOTATION MARK, code point 34),
        , (COMMA, code point 44),
        LF (code point 10) or CR (code point 13)
        must be quoted using a pair of quotation marks " 
        Blank nodes use the _:label form from Turtle and SPARQL */
        if (field.type == "bnode" && !value.startsWith("_:")) {
            value = "_:" + value;
        } else if (value.includes(String.fromCodePoint(34)) || value.includes(String.fromCodePoint(44)) ||
            value.includes(String.fromCodePoint(10)) || value.includes(String.fromCodePoint(13))) {
            // Within quote strings " is written using a pair of quotation marks "".
            value = value.replace(/"/g, "\"\"");
            value = "\"" + value + "\"";
        }
        return value;
    }

    private exportAsTSV() {
        //https://www.w3.org/TR/sparql11-results-csv-tsv/#csv
        var serialization = "";
        var separator = "\t";

        if (this.resultType == ResultType.tuple || this.resultType == ResultType.graph) {
            //headers
            //Variables are serialized in SPARQL syntax, using question mark ? character followed by the variable name
            var headers = this.headers;
            for (var i = 0; i < headers.length; i++) {
                serialization += headers[i] + separator;
            }
            serialization = serialization.slice(0, -1); //remove last separator
            serialization += "\n"; //and add new line
            //results
            var res: Array<any> = this.queryResult;
            for (var j = 0; j < res.length; j++) {
                for (var i = 0; i < headers.length; i++) {
                    if (res[j][headers[i]] != undefined) {
                        serialization += this.escapeForTSV(res[j][headers[i]]) + separator;
                    } else {
                        serialization += separator;
                    }
                }
                serialization = serialization.slice(0, -1); //remove last separator
                serialization += "\n"; //and add new line
            }
        } else if (this.resultType == ResultType.boolean) {
            serialization += "?result\n" + this.queryResult;
        }

        this.downloadSavedResult(serialization, "tsv");
    }

    /**
     * Field is an object {value, type} like the bindings in the sparql response of tuple query
     * if type is literal, it may contains an attribute "xml:lang" or "datatype"
     */
    private escapeForTSV(field: any): string {
        var value: string = field.value;
        /* IRIs enclosed in <...>,
        literals are enclosed with double quotes "..." or single quotes ' ...' with optional @lang or ^^ for datatype.
        Tab, newline and carriage return characters (codepoints 0x09, 0x0A, 0x0D) are encoded as \t, \n and \r
        Blank nodes use the _:label form from Turtle and SPARQL */
        if (field.type == "uri") {
            value = "<" + value + ">";
        } else if (field.type == "bnode" && !value.startsWith("_:")) {
            value = "_:" + value;
        } else if (field.type == "literal") {
            value = value.replace(/\t/g, "\\t");
            value = value.replace(/\n/g, "\\n");
            value = value.replace(/\r/g, "\\r");
            value = "\"" + value + "\"";
            if (field["xml:lang"] != undefined) {
                value += "@" + field["xml:lang"];
            }
            if (field["datatype"] != undefined) {
                value += "^^" + field["datatype"];
            }
        }
        return value;
    }

    private exportAsSpradsheet(format: "xlsx" | "ods") {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.sparqlService.exportQueryResultAsSpreadsheet(this.queryCache, format, this.inferred).subscribe(
            blob => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink("Export SPARQL results", null, exportLink, "sparql_export." + format);
            }
        );
    }

    private exportAsRdf() {
        var modalData = new ExportResultAsRdfModalData(this.queryCache, this.inferred);
        const builder = new BSModalContextBuilder<ExportResultAsRdfModalData>(
            modalData, undefined, ExportResultAsRdfModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ExportResultAsRdfModal, overlayConfig).result;
    }

    /**
     * Prepares a json or text file containing the given content and shows a modal to download it.
     */
    private downloadSavedResult(fileContent: string, type: "csv" | "tsv" | "json") {
        var data = new Blob([fileContent], { type: 'text/plain' });
        var textFile = window.URL.createObjectURL(data);
        var fileName = "result." + type;
        this.basicModals.downloadLink("Export SPARQL results", null, textFile, fileName).then(
            done => { window.URL.revokeObjectURL(textFile); },
            () => { }
        );
    }

    private getPrettyPrintTime(time: number) {
        if (time < 1000) {
            return time + " millisec";
        } else {
            var sec = Math.floor(time / 1000);
            var millisec: any = time % 1000;
            if (millisec < 10) {
                millisec = "00" + millisec;
            } else if (millisec < 100) {
                millisec = "0" + millisec;
            }
            return sec + "," + millisec + " sec";
        }
    }

    private getBindingShow(binding: any) {
        if (binding.type == "uri") {
            return "<" + binding.value + ">";
        } else if (binding.type == "bnode") {
            return "_:" + binding.value;
        } else if (binding.type == "literal") {
            var show = "\"" + binding.value + "\"";
            if (binding['xml:lang']) {
                show += "@" + binding['xml:lang'];
            }
            if (binding.datatype) {
                show += "^^<" + binding.datatype + ">";
            }
            return show;
        }
    }

    //LOAD/SAVE/PARAMETERIZE QUERY

    private loadQuery() {
        this.sharedModals.loadConfiguration("Load SPARQL query", ConfigurationComponents.SPARQL_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                this.setLoadedQueryConf(data.configuration);
            },
            () => {}
        );
    }

    private saveQuery() {
        let queryConfig: { [key: string]: any} = {
            sparql: this.query,
            type: this.queryMode,
            includeInferred: this.inferred
        }
        this.sharedModals.storeConfiguration("Store SPARQL query", ConfigurationComponents.SPARQL_STORE, queryConfig).then(
            (relativeRef: string) => {
                this.basicModals.alert("Save query", "Query saved succesfully");
            },
            () => {}
        )
    }

    private parameterizeQuery() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(QueryParameterizationMgrModal, overlayConfig).result.then(
            (data: QueryParameterizationMgrModalReturnData) => {
                /**
                 * configuration contains 2 props:
                 * "relativeReference": the reference of the query
                 * "variableBindings": the map of the bindings
                 */
                let relativeRef: string;
                let variableBindings: VariableBindings[];

                let properties: SettingsProp[] = data.configuration.properties;
                for (var i = 0; i < properties.length; i++) {
                    if (properties[i].name == "relativeReference") {
                        relativeRef = properties[i].value;
                    } else if (properties[i].name == "variableBindings") {
                        variableBindings = properties[i].value;
                    }
                }

                //load query
                this.configurationsService.getConfiguration(ConfigurationComponents.SPARQL_STORE, relativeRef).subscribe(
                    (conf: Configuration) => {
                        this.setLoadedQueryConf(conf);
                    }
                );

                //set variable bindings
                this.variableBindings = variableBindings;
                this.useBindings = true;
            },
            () => {}
        );
    }

    private onBindingsUpdate(bindings: Map<string, ARTNode>) {
        this.bindings = bindings;
    }

    /**
     * Set the query after the load of a stored query
     * @param tab 
     * @param conf 
     */
    private setLoadedQueryConf(conf: Configuration) {
        let query: string;
        let includeInferred: boolean = false;
        let confProps: ConfigurationProperty[] = conf.properties;
        for (var i = 0; i < confProps.length; i++) {
            if (confProps[i].name == "sparql") {
                query = confProps[i].value;
            } else if (confProps[i].name == "includeInferred") {
                includeInferred = confProps[i].value;
            }
        }
        this.query = query;
        this.inferred = includeInferred;
        setTimeout(() => {
            //in order to detect the change of @Input query in the child YasguiComponent
            this.viewChildYasgui.forceContentUpdate();
        });
    }

    private onBindingClick(binding: any) {
        if (this.isBindingResource(binding)) {
            let res: ARTResource;
            if (binding.type == "uri") {
                res = new ARTURIResource(binding.value);
            } else {
                res = new ARTBNode("_:" + binding.value);
            }
            this.sharedModals.openResourceView(res, false);
        }
    }

    private isBindingResource(binding: any): boolean {
        return (binding.type == "uri" || binding.type == "bnode");
    }

}
