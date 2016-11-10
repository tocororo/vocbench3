import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../../utils/ARTResources";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {SkosServices} from "../../../services/skosServices";
import {SearchServices} from "../../../services/searchServices";
import {ModalServices} from "../../../widget/modal/modalServices";

@Component({
	selector: "scheme-list",
	templateUrl: "./schemeListComponent.html",
})
export class SchemeListComponent {
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Input() hideSearch: boolean = false;
    
    private schemeList: ARTURIResource[];
    private selectedScheme: ARTURIResource;
    
    constructor(private skosService: SkosServices, private searchService: SearchServices,
        private modalService: ModalServices, private vbCtx: VocbenchCtx) {}
    
    ngOnInit() {
        this.skosService.getAllSchemesList(this.vbCtx.getContentLanguage(true)).subscribe(
            schemeList => {
                this.schemeList = schemeList;
            }
        );
    }
    
    private selectScheme(scheme: ARTURIResource) {
        if (this.selectedScheme == undefined) {
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty(ResAttribute.SELECTED, true);    
        } else if (this.selectedScheme.getURI() != scheme.getURI()) {
            this.selectedScheme.deleteAdditionalProperty(ResAttribute.SELECTED);
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty(ResAttribute.SELECTED, true);
        }
        this.selectedScheme = scheme;
        this.nodeSelected.emit(scheme);
    }

    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.conceptScheme], true, true, "contain",
                this.vbCtx.getContentLanguage(true)).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectScheme(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                selectedResource => {
                                    this.selectScheme(selectedResource);
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
    
}