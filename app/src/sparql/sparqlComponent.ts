import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {SparqlServices} from "../services/sparqlServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';
import {ModalServices} from "../widget/modal/modalServices";

@Component({
    selector: "sparql-component",
    templateUrl: "app/src/sparql/sparqlComponent.html",
    providers: [SparqlServices],
    host: { class: "pageComponent" }
})
export class SparqlComponent {
    
    private tabs: Array<any> = [{
        query: "SELECT * WHERE { ?s ?p ?o } LIMIT 10",
        queryMode: "query",
        headers: null,
        queryResult: null,
        queryInProgress: false,
        queryTime: null,
        inferred: false,
        removable: false,
        active: true
    }];
    private activeTab = this.tabs[0];
    
    constructor(private vbCtx: VocbenchCtx, private router: Router, private sparqlService:SparqlServices,
            private modalService: ModalServices) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    private doQuery(tab) {
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
            err => { }
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
    
    //TAB HANDLER
    
    addTab() {
        this.activeTab.active = false;
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