import {Component, ChangeDetectionStrategy} from "angular2/core";
import {Router} from 'angular2/router';
import {TAB_DIRECTIVES, Alert} from 'ng2-bootstrap/ng2-bootstrap';
import {CORE_DIRECTIVES} from 'angular2/common';
import {SparqlServices} from "../services/sparqlServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';

@Component({
	selector: "sparql-component",
	templateUrl: "app/src/sparql/sparqlComponent.html",
    providers: [SparqlServices],
    directives: [TAB_DIRECTIVES, CORE_DIRECTIVES, Alert],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SparqlComponent {
    
    private tabs: Array<any> = [];
    
    constructor(private vbCtx: VocbenchCtx, private router: Router, private sparqlService:SparqlServices) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    private addTab() {
        this.tabs.push({ 
            query: "SELECT * WHERE { ?s ?p ?o } LIMIT 10",
            queryMode: "query", 
            headers: null,
            queryResult: null,
            queryInProgress: false,
            queryTime: null,
            inferred: false,
            removable: true,
            active: true
        });
    }
    
    private doQuery(tab, queryTextArea: HTMLInputElement) {
        var initTime = new Date().getTime();
        this.sparqlService.resolveQuery(tab.query, "SPARQL", tab.inferred, tab.queryMode).subscribe(
            data => {
                //calculates the time spent in query
                var finishTime = new Date().getTime();
                var diffTime = finishTime - initTime;
                tab.queryTime = this.getPrettyPrintTime(diffTime);
                //process result
                tab.headers = data.sparql.head.vars;
                tab.queryResult = data.sparql.results.bindings;
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            }
        );
    }
    
    private clear(tab) {
        tab.headers = null;
        tab.queryResult = null;
        tab.queryTime = null;
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