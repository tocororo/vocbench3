import {Component} from "angular2/core";
import {SparqlServices} from "../services/sparqlServices";

@Component({
	selector: "sparql-component",
	templateUrl: "app/src/sparql/sparqlComponent.html",
    providers: [SparqlServices],
})
export class SparqlComponent {
    
    public query:string = "SELECT * WHERE { ?s ?p ?o } LIMIT 10";
    public queryMode: string = "query";
    public headers: string[];
    public queryResult: string[];
    public queryInProgress: boolean = false;
    public queryTime: string;
    public inferred: boolean = false;
    
    constructor(private sparqlService:SparqlServices) {}
    
    public doQuery() {
        var lang = "SPARQL";
        var initTime = new Date().getTime();
        this.sparqlService.resolveQuery(this.query, lang, this.inferred, this.queryMode)
            .subscribe(
                data => {
                    //calculates the time spent in query
                    var finishTime = new Date().getTime();
                    var diffTime = finishTime - initTime;
                    this.queryTime = this.getPrettyPrintTime(diffTime);
                    //process result
                    this.headers = data.sparql.head.vars;
                    this.queryResult = data.sparql.results.bindings;       
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    public clear() {
        this.headers = null;
        this.queryResult = null;
        this.queryTime = null;
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
    
}