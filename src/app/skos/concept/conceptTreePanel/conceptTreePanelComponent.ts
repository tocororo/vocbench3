import {Component, Input, Output, EventEmitter, ViewChild} from "@angular/core";
import {ConceptTreeComponent} from "../conceptTree/conceptTreeComponent";
import {SkosServices} from "../../../services/skosServices";
import {SkosxlServices} from "../../../services/skosxlServices";
import {SearchServices} from "../../../services/searchServices";
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
    
    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent;
    
    private selectedConcept:ARTURIResource;
    private searchInputPlaceholder: string;
    
    private ONTO_TYPE: string;
    
	constructor(private skosService:SkosServices, private skosxlService: SkosxlServices, private searchService: SearchServices, 
        private modalService: ModalServices, private vbCtx:VocbenchCtx) {}
    
    ngOnInit() {
        this.searchInputPlaceholder = this.scheme ? "Search..." : "Search not available in no-scheme mode";
        this.ONTO_TYPE = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }
    
    private createConcept() {
        this.modalService.newResource("Create new skos:Concept", this.vbCtx.getContentLanguage()).then(
            result => {
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
            result => {
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
    
    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], true, false, "contain",
                this.vbCtx.getContentLanguage(true), this.vbCtx.getScheme()).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.viewChildTree.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                selectedResource => {
                                    this.viewChildTree.openTreeAt(selectedResource);
                                },
                                () => {}
                            );
                        }
                    }
                }
            );
        }
    }
    
    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key, searchedText) {
        if (key == "13") {
            this.doSearch(searchedText);           
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