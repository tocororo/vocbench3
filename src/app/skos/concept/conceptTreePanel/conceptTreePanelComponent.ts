import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ConceptTreeComponent} from "../conceptTree/conceptTreeComponent";
import {SkosServices} from "../../../services/skosServices";
import {SkosxlServices} from "../../../services/skosxlServices";
import {ModalServices} from "../../../widget/modal/modalServices";
import {ARTURIResource, RDFResourceRolesEnum} from "../../../utils/ARTResources";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";

@Component({
	selector: "concept-tree-panel",
	templateUrl: "./conceptTreePanelComponent.html",
})
export class ConceptTreePanelComponent {
    @Input() scheme:ARTURIResource;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeCtrlClicked = new EventEmitter<ARTURIResource>(); 
    
    private selectedConcept:ARTURIResource;
    
    private ONTO_TYPE: string;
    
	constructor(private skosService:SkosServices, private skosxlService: SkosxlServices, 
        private modalService: ModalServices, private vbCtx:VocbenchCtx) {}
    
    ngOnInit() {
        this.ONTO_TYPE = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }
    
    private createConcept() {
        this.modalService.newResource("Create new skos:Concept", this.vbCtx.getContentLanguage()).then(
            (result: any) => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createTopConcept(result.label, result.lang, this.vbCtx.getScheme(),
                        result.name, this.vbCtx.getContentLanguage()).subscribe();
                } else { //SKOSXL
                    this.skosxlService.createTopConcept(result.label, result.lang, this.vbCtx.getScheme(),
                        result.name, this.vbCtx.getContentLanguage()).subscribe();
                }
            },
            () => {}
        );
    }
    
    private createNarrower() {
        this.modalService.newResource("Create a skos:narrower", this.vbCtx.getContentLanguage()).then(
            (result: any) => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNarrower(result.label, result.lang, this.selectedConcept, this.vbCtx.getScheme(),
                        result.name, this.vbCtx.getContentLanguage()).subscribe();
                } else { //SKOSXL
                    this.skosxlService.createNarrower(result.label, result.lang, this.selectedConcept, this.vbCtx.getScheme(),
                        result.name, this.vbCtx.getContentLanguage()).subscribe();
                }
            },
            () => {}
        );
    }
    
    private deleteConcept() {
        if (this.ONTO_TYPE == "SKOS") {
            this.skosService.deleteConcept(this.selectedConcept).subscribe(
                stResp => {
                    this.selectedConcept = null;
                    this.nodeSelected.emit(undefined);
                }
            );
        } else { //SKOSXL
            this.skosxlService.deleteConcept(this.selectedConcept).subscribe(
                stResp => {
                    this.selectedConcept = null;
                    this.nodeSelected.emit(undefined);
                }
            );
        }
    }
    
    //EVENT LISTENERS
    private onNodeSelected(node: ARTURIResource) {
        this.selectedConcept = node;
        this.nodeSelected.emit(node);
    }

    private onNodeCtrlClicked(node: ARTURIResource) {
        console.log("[ConceptTreePanelComponent] node ctrl+clicked " + node.getURI());
        this.nodeCtrlClicked.emit(node);
    }
    
    //when a concept is removed from a scheme, it should be still visible in res view,
    //but no more selected in the tree if it was in the current scheme 
    private onConceptRemovedFromScheme(concept: ARTURIResource) {
        this.selectedConcept = null;
    }
    
}