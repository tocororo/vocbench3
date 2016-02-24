import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {SparqlServices} from "../services/sparqlServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';

@Component({
	selector: "sparql-component",
	templateUrl: "app/src/sparql/sparqlComponent.html",
    providers: [SparqlServices],
})
export class SparqlComponent {
    
    private query:string = "SELECT * WHERE { ?s ?p ?o } LIMIT 10";
    private queryMode: string = "query";
    private headers: string[];
    private queryResult: string[];
    private queryInProgress: boolean = false;
    private queryTime: string;
    private inferred: boolean = false;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router, private sparqlService:SparqlServices) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    private doQuery() {
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
    
    private clear() {
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