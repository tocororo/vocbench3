import {Component} from "@angular/core";
import {SparqlServices} from "../services/sparqlServices";
import {MetadataServices} from "../services/metadataServices";
import {ModalServices} from '../widget/modal/modalServices';

@Component({
    selector: "sparql-component",
    templateUrl: "./sparqlComponent.html",
    host: { class: "pageComponent" }
})
export class SparqlComponent {
    
    private sampleQuery: string = "SELECT * WHERE {\n    ?s ?p ?o .\n} LIMIT 10";
    private tabs: Array<any> = [];
    private activeTab;
    
    constructor(private sparqlService:SparqlServices, private metadataService: MetadataServices, private modalService: ModalServices) {}
    
    ngOnInit() {
        this.metadataService.getNSPrefixMappings().subscribe(
            mappings => {
                //collect the prefix namespace mappings
                var prefixImports: string = "";
                for (var i = 0; i < mappings.length; i++) {
                    prefixImports += "PREFIX " + mappings[i].prefix + ": <" + mappings[i].namespace + ">\n";
                }
                //set them as suffix of sampleQuery
                this.sampleQuery = prefixImports + "\n" + this.sampleQuery;
                //initialize the first tab
                this.tabs.push({
                    query: this.sampleQuery,
                    queryMode: "query",
                    resultType: null, //graph or tuple
                    headers: null,
                    queryResult: null,
                    queryInProgress: false,
                    queryValid: true,
                    queryTime: null,
                    inferred: false,
                    removable: false,
                    active: true
                });
                this.activeTab = this.tabs[0];
            }
        )
    }
    
    private doQuery(tab) {
        var initTime = new Date().getTime();
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.sparqlService.resolveQuery(tab.query, "SPARQL", tab.inferred, tab.queryMode).subscribe(
            data => {
                //calculates the time spent in query
                var finishTime = new Date().getTime();
                var diffTime = finishTime - initTime;
                tab.queryTime = this.getPrettyPrintTime(diffTime);
                //process result
                tab.resultType = data.resulttype;
                if (data.resulttype == "tuple") {
                    tab.headers = data.sparql.head.vars;
                    tab.queryResult = data.sparql.results.bindings;
                } else if (data.resulttype == "graph") {
                    tab.headers = ["subj", "pred", "obj"];
                    tab.queryResult = data.stm;
                }
                document.getElementById("blockDivFullScreen").style.display = "none";
            },
            err => {
                document.getElementById("blockDivFullScreen").style.display = "none";
            }
        );
    }

    /**
     * Listener of event querychange, emitted from YasquiComponent.
     * Event is an object {query: string, valid: boolean, mode} where
     * query is the code written in the textarea
     * valid tells wheter the query is syntactically correct
     * mode tells the query mode (query/update) 
     */
    private onQueryChange(event) {
        this.activeTab.query = event.query;
        this.activeTab.queryValid = event.valid;
        this.activeTab.queryMode = event.mode;
    }

    private clear(tab) {
        tab.headers = null;
        tab.queryResult = null;
        tab.queryTime = null;
    }
    
    private saveResultAsJSON(tab) {
        var fileContent: string;
        if (tab.resultType == "tuple") {
            fileContent = JSON.stringify(tab.queryResult);
        } else if (tab.resultType == "graph") {
            fileContent = JSON.stringify(tab.queryResult);
        }
        this.downloadSavedResult(fileContent, "json");
    }
    
    private saveResultAsText(tab) {
        var fileContent: string = "";
        var separator = "; ";
        if (tab.resultType == "tuple") {
            var cols = tab.headers;
            for (var i = 0; i < cols.length; i++) {
                var variable_name = cols[i];
                fileContent += variable_name + separator;
            }
            fileContent += "\n\n";
            var bindings = tab.queryResult;
            for (var bind in bindings) {
                for (var i = 0; i < cols.length; i++) {
                    var variable_name = cols[i];
                    var element = (bindings[bind])[variable_name];
                    if (typeof element != "undefined") {
                        var lblValue = "";
                        var type = "";
                        if (element.type == "uri") {
                            lblValue = element.value;
                        } else if (element.type == "literal") {
                            lblValue = element.value;
                            if (element["xml:lang"] != null) {
                                lblValue = lblValue + " (" + element["xml:lang"] + ")";
                            }
                        } else if (element.type == "typed-literal") {
                            lblValue = element.value;
                        } else if (element.type == "bnode") {
                            lblValue = element.value;
                        }
                        fileContent += lblValue + separator;
                    } else {
                        fileContent += separator;
                    }
                }
                fileContent += "\n";
            }
        } else if (tab.resultType == "graph") {
            var stms = tab.queryResult;
            for (var stm in stms) {
                var sbjName = JSON.stringify(stms[stm].subj).replace(/\"/g, "");
                var preName = JSON.stringify(stms[stm].pred).replace(/\"/g, "");
                var objName = JSON.stringify(stms[stm].obj).replace(/\"/g, "");
                fileContent += sbjName + separator + preName + separator + objName + separator + "\n";
            }
        }
        this.downloadSavedResult(fileContent, "text");
    }
    
    /**
     * Prepares a json or text file containing the given content and shows a modal to download it.
     */
    private downloadSavedResult(fileContent: string, type: "text" | "json") {
        var data = new Blob([fileContent], {type: 'text/plain'});
        var textFile = window.URL.createObjectURL(data);
        var fileName: string;
        type == "text" ? fileName = "results.txt" : fileName = "results.json"
        this.modalService.downloadLink("Save SPARQL results", null, textFile, fileName).then(
            done => { window.URL.revokeObjectURL(textFile); },
            () => {}
        );
    }
    
    private getPrettyPrintTime(time) {
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
    
    //TAB HANDLER
    
    addTab() {
        this.activeTab.active = false;
        this.tabs.push({
            query: this.sampleQuery,
            queryMode: "query",
            headers: null,
            queryResult: null,
            queryInProgress: false,
            queryValid: true,
            queryTime: null,
            inferred: false,
            removable: true,
            active: true
        });
        this.activeTab = this.tabs[this.tabs.length-1];
    }
    
    selectTab(t) {
        this.activeTab.active = false;
        t.active = true;
        this.activeTab = t;
    }
    
    closeTab(t) {
        var tabIdx = this.tabs.indexOf(t);
        //if the closed tab is active, change the active tab
        if (t.active) {
            if (tabIdx == this.tabs.length-1) { //if the closed tab was the last one, active the previous
                this.tabs[tabIdx-1].active = true;
                this.activeTab = this.tabs[tabIdx-1];
            } else { //otherwise active the next
                this.tabs[tabIdx+1].active = true;
                this.activeTab = this.tabs[tabIdx+1];
            }
        }
        this.tabs.splice(tabIdx, 1);
    }
}