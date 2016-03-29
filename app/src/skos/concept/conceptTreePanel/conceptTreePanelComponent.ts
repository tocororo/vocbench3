import {Component, Input, Output, EventEmitter, ViewChild} from "angular2/core";
import {RouterLink} from "angular2/router";
import {ConceptTreeComponent} from "../conceptTree/conceptTreeComponent";
import {SkosServices} from "../../../services/skosServices";
import {SearchServices} from "../../../services/searchServices";
import {ModalServices} from "../../../widget/modal/modalServices";
import {ARTURIResource} from "../../../utils/ARTResources";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {RDFResourceRolesEnum} from "../../../utils/Enums";

@Component({
	selector: "concept-tree-panel",
	templateUrl: "app/src/skos/concept/conceptTreePanel/conceptTreePanelComponent.html",
	directives: [ConceptTreeComponent, RouterLink],
    providers: [SkosServices, SearchServices],
})
export class ConceptTreePanelComponent {
    @Input() scheme:ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent;
    
    private selectedConcept:ARTURIResource;
    private searchInputPlaceholder: string;
    
	constructor(private skosService:SkosServices, private searchService: SearchServices, 
        private modalService: ModalServices, private vbCtx:VocbenchCtx) {}
    
    ngOnInit() {
        this.searchInputPlaceholder = this.scheme ? "Search..." : "Search not available in no-scheme mode"; 
    }
    
    private createConcept() {
        this.modalService.newResource("Create new skos:Concept").then(
            result => {
                this.skosService.createTopConcept(result.name, this.vbCtx.getScheme(), result.label, result.lang).subscribe(
                    data => { },
                    err => { }
                );
            },
            () => {}
        );
    }
    
    private createNarrower() {
        this.modalService.newResource("Create a skos:narrower").then(
            result => {
                this.skosService.createNarrower(result.name, this.selectedConcept, this.vbCtx.getScheme(), result.label, result.lang).subscribe(
                    data => { },
                    err => { }
                );
            },
            () => {}
        );
    }
    
    private deleteConcept() {
        this.skosService.deleteConcept(this.selectedConcept).subscribe(
            stResp => {
                this.selectedConcept = null;
                this.itemSelected.emit(undefined);
            },
            err => { }
        );
    }
    
    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], true, "contain", this.vbCtx.getScheme().getURI()).subscribe(
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
                },
                err => { }
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
    private onNodeSelected(node:ARTURIResource) {
        this.selectedConcept = node;
        this.itemSelected.emit(node);
    }
    
}