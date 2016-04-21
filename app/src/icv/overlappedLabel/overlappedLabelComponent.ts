import {Component} from "angular2/core";
import {Router, RouteParams} from 'angular2/router';
import {Observable} from 'rxjs/Observable';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource, ARTLiteral} from "../../utils/ARTResources";
import {RDFResourceRolesEnum, RDFTypesEnum} from "../../utils/Enums";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";
import {SkosxlServices} from "../../services/skosxlServices";

@Component({
    selector: "overlapped-label-component",
    templateUrl: "app/src/icv/overlappedLabel/overlappedLabelComponent.html",
    providers: [IcvServices, SkosServices, SkosxlServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class OverlappedLabelComponent {
    
    private brokenRecordList: Array<any>; //TODO should be {concept: ARTURIResource, prefLabel: ARTLiteral, altLabel: ARTLiteral}
    private ontoType: string;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private vbCtx: VocbenchCtx, private modalService: ModalServices,
        private router: Router, private routeParams: RouteParams) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }
    
    ngOnInit() {
        this.ontoType = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }
    
    /**
     * Run the check
     * TODO the service should be refactore so that it will return both concept and scheme with overlapped labels
     * Each <record> element with
     * - <uri> the resource with overlapped labels (the role determines if the resource is concept or conceptScheme)
     * and the two <plainLiteral> representing the labels
     */
    runIcv() {
        //TODO check when service will be refactored
        if (this.ontoType == "SKOS") {
            document.getElementById("blockDivIcv").style.display = "block";
            this.icvService.listConceptsWithOverlappedSKOSLabel().subscribe(
                stResp => {
                    //TODO
                },
                err => { },
                () => document.getElementById("blockDivIcv").style.display = "none"
            );
        } else if (this.ontoType == "SKOS-XL") {
            document.getElementById("blockDivIcv").style.display = "block";
            this.icvService.listConceptsWithOverlappedSKOSXLLabel().subscribe(
                stResp => {
                    //TODO
                },
                err => { },
                () => document.getElementById("blockDivIcv").style.display = "none"
            );
        }
    }
    
    /**
     * Fixes by changing prefLabel
     */
    changePrefLabel(record) {
        //TODO
    }
    
    /**
     * Fixes by removing prefLabel
     */
    removePrefLabel(record) {
        //TODO
    }
    
    /**
     * Fixes by changing altLabel
     */
    changeAltLabel(record) {
        //TODO
    }
    
    /**
     * Fixes by removing altLabel
     */
    removeAltLabel(record) {
        //TODO
    }
    
}