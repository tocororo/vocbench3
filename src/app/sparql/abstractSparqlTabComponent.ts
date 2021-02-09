import { Directive, EventEmitter, Output, ViewChild } from "@angular/core";
import { Observable } from 'rxjs';
import { Configuration, ConfigurationProperty } from "../models/Configuration";
import { PrefixMapping } from "../models/Metadata";
import { QueryChangedEvent, QueryMode } from "../models/Sparql";
import { SparqlServices } from "../services/sparqlServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { UIUtils } from "../utils/UIUtils";
import { VBActionsEnum } from "../utils/VBActions";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { SharedModalServices } from '../widget/modal/sharedModal/sharedModalServices';
import { YasguiComponent } from "./yasguiComponent";

@Directive()
export abstract class AbstractSparqlTabComponent {

    @ViewChild(YasguiComponent, { static: false }) viewChildYasgui: YasguiComponent;

    @Output() updateName: EventEmitter<string> = new EventEmitter();
    @Output() savedStatus: EventEmitter<boolean> = new EventEmitter();

    query: string;
    queryCache: string; //contains the last query submitted (useful to invoke the export excel)
    protected queryMode: QueryMode = QueryMode.query;
    inferred: boolean = false;
    storedQueryReference: string;

    private sampleQuery: string = "SELECT * WHERE {\n    ?s ?p ?o .\n} LIMIT 10";
    
    queryInProgress: boolean = false;
    queryValid: boolean = true;
    queryTime: string;

    queryResultResp: any;

    protected sparqlService: SparqlServices;
    protected basicModals: BasicModalServices;
    protected sharedModals: SharedModalServices;
    constructor(sparqlService: SparqlServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        this.sparqlService = sparqlService;
        this.basicModals = basicModals;
        this.sharedModals = sharedModals;
    }

    ngOnInit() {
        //collect the prefix namespace mappings
        let mappings: PrefixMapping[] = VBContext.getPrefixMappings();
        let prefixImports: string = "";
        for (let i = 0; i < mappings.length; i++) {
            prefixImports += "PREFIX " + mappings[i].prefix + ": <" + mappings[i].namespace + ">\n";
        }
        //set them as suffix of sampleQuery
        this.sampleQuery = prefixImports + "\n" + this.sampleQuery;

        this.query = this.sampleQuery;
    }

    doQuery() {
        this.queryTime = null;
        let initTime = new Date().getTime();
        this.queryCache = this.query; //stored the submitted query

        if (this.queryMode == QueryMode.query) {
            if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.sparqlEvaluateQuery)) {
                this.basicModals.alert({key:"STATUS.OPERATION_DENIED"}, {key:"MESSAGES.UNAUTHORIZED_SPARQL_QUERY"});
                return;
            }
            UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
            this.evaluateQueryImpl().subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                    this.sparqlResponseHandler(stResp, initTime);
                },
            );
        } else { //queryMode "update"
            if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.sparqlExecuteUpdate)) {
                this.basicModals.alert({key:"STATUS.OPERATION_DENIED"}, {key:"MESSAGES.UNAUTHORIZED_SPARQL_UPDATE"});
                return;
            }
            UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
            this.executeUpdateImpl().subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                    this.sparqlResponseHandler(stResp, initTime);
                }
            );
        }
    }

    abstract evaluateQueryImpl(): Observable<any>;
    abstract executeUpdateImpl(): Observable<any>;

    private sparqlResponseHandler(stResp: any, initTime: number) {
        this.queryResultResp = stResp;
        //calculates the time spent in query
        let finishTime = new Date().getTime();
        let diffTime = finishTime - initTime;
        this.queryTime = this.getPrettyPrintTime(diffTime);
    }

    /**
     * Listener of event querychange, emitted from YasquiComponent.
     * Event is an object {query: string, valid: boolean, mode} where
     * query is the code written in the textarea
     * valid tells wheter the query is syntactically correct
     * mode tells the query mode (query/update) 
     */
    onQueryChange(event: QueryChangedEvent) {
        this.query = event.query;
        this.queryValid = event.valid;
        this.queryMode = event.mode;
        this.savedStatus.emit(false);
    }

    clear() {
        this.queryTime = null;
        this.queryResultResp = null;
    }

    private getPrettyPrintTime(time: number) {
        if (time < 1000) {
            return time + " millisec";
        } else {
            let sec = Math.floor(time / 1000);
            let millisec: any = time % 1000;
            if (millisec < 10) {
                millisec = "00" + millisec;
            } else if (millisec < 100) {
                millisec = "0" + millisec;
            }
            return sec + "," + millisec + " sec";
        }
    }

    //LOAD/SAVE/PARAMETERIZE QUERY

    /**
     * Loads a configuration (stored query or parameterized query)
     */
    abstract loadConfiguration(): void;
    /**
     * Stores a configuration (stored query or parameterized query)
     */
    abstract saveConfiguration(): void;

    /**
     * Set the query after the load of a stored query
     * @param conf 
     */
    setLoadedQueryConf(conf: Configuration) {
        let query: string;
        let includeInferred: boolean = false;
        let confProps: ConfigurationProperty[] = conf.properties;
        for (let i = 0; i < confProps.length; i++) {
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
            this.savedStatus.emit(true);
        });
    }

}