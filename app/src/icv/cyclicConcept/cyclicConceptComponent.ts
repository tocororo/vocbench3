import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "cyclic-concept-component",
    templateUrl: "app/src/icv/cyclicConcept/cyclicConceptComponent.html",
    providers: [IcvServices, SkosServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class CyclicConceptComponent {
    
    private brokenRecordList: Array<any>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, 
            private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        }
        //navigate to Projects view if a project is not selected
        if (vbCtx.getWorkingProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    /**
     * Run the check
     */
    runIcv() {
        //TODO change the service.
        //currently the service returns <record> elements that contain
        //node1, node2 and topCyclicConcept attributes that represent
        //the nodes of the edge and the concept that probably is the cause of the cycle.
        //the new service should return different <cycle> element for each cycle.
        //Then each <cycle> should be described by a collection of <edge> with two <uri>
        //representing the nodes of the edge, and a <topCyclicConcept> containign the <uri>
        //of the node that casues the cycle.
    }
    
    /**
     * 
     */
    fix(concept) {//concept could be the topCyclicConcept with whom retrieve the cycle record
        //TODO the fix should remove the broader/narrower relation of the topCyclicConcept
    }
    
    /**
     * TODO: provide a quickFix for a so unlikely and delicate problem? maybe it's better if every cycle is fixed
     * separately 
     */
    quickFix() {
    }
    
    showGraph(concept) {//concept could be the topCyclicConcept with whom retrieve the cycle record
        //TODO
    }
    
}