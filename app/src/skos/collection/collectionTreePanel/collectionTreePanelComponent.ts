import {Component, Input, Output, EventEmitter, ViewChild} from "@angular/core";
import {RouterLink} from "@angular/router-deprecated";
import {CollectionTreeComponent} from "../collectionTree/collectionTreeComponent";
import {SkosServices} from "../../../services/skosServices";
import {SkosxlServices} from "../../../services/skosxlServices";
import {SearchServices} from "../../../services/searchServices";
import {ModalServices} from "../../../widget/modal/modalServices";
import {ARTURIResource, RDFResourceRolesEnum} from "../../../utils/ARTResources";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";

@Component({
	selector: "collection-tree-panel",
	templateUrl: "app/src/skos/collection/collectionTreePanel/collectionTreePanelComponent.html",
	directives: [CollectionTreeComponent, RouterLink],
    providers: [SkosServices, SkosxlServices, SearchServices],
})
export class CollectionTreePanelComponent {
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent;
    
    private selectedCollection:ARTURIResource;
    private searchInputPlaceholder: string;
    
    private ONTO_TYPE: string;
    
	constructor(private skosService:SkosServices, private skosxlService: SkosxlServices, private searchService: SearchServices, 
        private modalService: ModalServices, private vbCtx:VocbenchCtx) {}
    
    ngOnInit() {
        this.ONTO_TYPE = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }
    
    private createCollection() {
        this.modalService.newResource("Create new skos:Collection", this.vbCtx.getContentLanguage()).then(
            result => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createRootCollection(result.name, result.label, result.lang,
                        this.vbCtx.getContentLanguage(true)).subscribe();
                } else { //SKOSXL
                    this.skosxlService.createRootCollection(result.name, result.label, result.lang,
                        this.vbCtx.getContentLanguage(true)).subscribe();
                }
            },
            () => {}
        );
    }
    
    private createNestedCollection() {
        this.modalService.newResource("Create a nested skos:Collection", this.vbCtx.getContentLanguage()).then(
            result => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNestedCollection(this.selectedCollection, result.name,
                        result.label, result.lang, this.vbCtx.getContentLanguage(true)).subscribe();
                } else { //SKOSXL
                    this.skosxlService.createNestedCollection(this.selectedCollection, result.name,
                        result.label, result.lang, this.vbCtx.getContentLanguage(true)).subscribe();
                }
            },
            () => {}
        );
    }
    
    private deleteCollection() {
        alert("Delete collection still not available")
        // if (this.ONTO_TYPE == "SKOS") {
        //     this.skosService.deleteConcept(this.selectedCollection).subscribe(
        //         stResp => {
        //             this.selectedCollection = null;
        //             this.itemSelected.emit(undefined);
        //         }
        //     );
        // } else { //SKOSXL
        //     this.skosxlService.deleteConcept(this.selectedCollection).subscribe(
        //         stResp => {
        //             this.selectedCollection = null;
        //             this.itemSelected.emit(undefined);
        //         }
        //     );
        // }
    }
    
    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.skosCollection], true, "contain",
                this.vbCtx.getContentLanguage(true)).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            alert("Feature not yet availabel. Opening tree at " + JSON.stringify(searchResult[0]));
                            // this.viewChildTree.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                selectedResource => {
                                    alert("Feature not yet availabel. Opening tree at " + JSON.stringify(selectedResource));
                                    // this.viewChildTree.openTreeAt(selectedResource);
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
    private onNodeSelected(node:ARTURIResource) {
        this.selectedCollection = node;
        this.itemSelected.emit(node);
    }
    
}