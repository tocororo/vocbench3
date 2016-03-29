import {Component} from "angular2/core";
import {Router, RouterLink} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource} from "../../utils/ARTResources";
import {RDFResourceRolesEnum} from "../../utils/Enums";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "dangling-concept-component",
    templateUrl: "app/src/icv/danglingConcept/danglingConceptComponent.html",
    providers: [IcvServices, SkosServices],
    directives: [RdfResourceComponent, RouterLink],
    host: { class : "pageComponent" }
})
export class DanglingConceptComponent {
    
    private schemeList: Array<ARTURIResource>;
    private selectedScheme: ARTURIResource;
    private selectedSchemeURI: string; //workaround for 2 way binding still not supported for <select>
    private brokenConceptList: Array<ARTURIResource>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, 
            private vbCtx: VocbenchCtx, private modalService: ModalServices, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    ngOnInit() {
        this.skosService.getAllSchemesList().subscribe(
            schemeList => {
                this.schemeList = schemeList;
            },
            err => { }
        );
        this.selectedScheme = this.vbCtx.getScheme();
        if (this.selectedScheme != undefined) {
            this.selectedSchemeURI = this.selectedScheme.getURI();
        }
    }
    
    /**
     * Run the check
     */
    private runIcv() {
        //TODO check when service will be refactored
        document.getElementById("blockDivIcv").style.display = "block";
        this.icvService.listDanglingConcepts().subscribe(
            stResp => {
                this.brokenConceptList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    if (recordColl[i].getAttribute("scheme") == this.selectedScheme.getURI()) {
                        var dc = new ARTURIResource(recordColl[i].getAttribute("concept"), recordColl[i].getAttribute("concept"), RDFResourceRolesEnum.concept);
                        this.brokenConceptList.push(dc);
                    }
                }
            },
            err => { },
            () => document.getElementById("blockDivIcv").style.display = "none"
        );
    }
    
    /**
     * Fixes concept by setting the concept as topConceptOf the current scheme 
     */
    private setAsTopConcept(concept: ARTURIResource) {
        this.skosService.addTopConcept(concept, this.selectedScheme).subscribe(
            data => {
                //remove the concept from the danglingConceptList
                this.brokenConceptList.splice(this.brokenConceptList.indexOf(concept), 1);
            },
            err => { }
        );
    }
    
    /**
     * Fixes all concepts by setting them all as topConceptOf the current scheme
     */
    private setAllTopConcept() {
        //TODO this fix requires a new service server side that takes a list of concept and sets them as topConcept of a scheme
        alert("Fix not yet available");
    }
    
    /**
     * Fixes concept by selecting a broader concept
     */
    private selectBroader(concept: ARTURIResource) {
        alert("Fix not yet available");
        //TODO here I should open a modal to show the concept tree and select a concept
    }
    
    /**
     * Fixes all concepts by selecting a broader concept for them all 
     */
    private selectBroaderForAll() {
        //TODO this fix requires a new service server side that takes a list of concept and sets for them a broader concept
        alert("Fix not yet available");
        //TODO here I should open a modal to show the concept tree and select a concept
    }
    
    /**
     * Fixes concept by removing the concept from the current scheme 
     */
    private removeFromScheme(concept: ARTURIResource) {
        this.modalService.confirm("Remove from scheme", "Warning, if this concept has narrowers, removing the " +
                "dangling concept from the scheme may generate other dangling concepts. Are you sure to proceed?").then(
            result => {
                this.skosService.removeConceptFromScheme(concept, this.selectedScheme).subscribe(
                    data => {
                        //remove the concept from the danglingConceptList
                        this.brokenConceptList.splice(this.brokenConceptList.indexOf(concept), 1);
                    },
                    err => { }
                );
            },
            () => {}
        );
    }
    
    /**
     * Fixes concepts by removing them all from the current scheme 
     */
    private removeAllFromScheme() {
        //TODO this fix requires a new service server side that takes a list of concept removes them from a scheme
        alert("Fix not yet available");
    }
    
    //workaround for 2 way binding still not supported for <select> https://github.com/angular/angular/issues/4843
    private changeScheme() {
        this.selectedScheme = this.schemeList.find(
            scheme => scheme.getURI() == this.selectedSchemeURI
        );
    }
    
}