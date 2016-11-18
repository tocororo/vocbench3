import {Component, Output, EventEmitter} from "@angular/core";
import {SkosServices} from "../../../services/skosServices";
import {SkosxlServices} from "../../../services/skosxlServices";
import {SearchServices} from "../../../services/searchServices";
import {ModalServices} from "../../../widget/modal/modalServices";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../../utils/ARTResources";
import {VocbenchCtx} from '../../../utils/VocbenchCtx';
import {VBEventHandler} from "../../../utils/VBEventHandler";

@Component({
	selector: "scheme-list-panel",
	templateUrl: "./schemeListPanelComponent.html",
})
export class SchemeListPanelComponent {
    
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    
    private schemeList:ARTURIResource[];
    private activeScheme:ARTURIResource;
    private selectedScheme:ARTURIResource;
    
    private ONTO_TYPE: string;
    
    private eventSubscriptions = [];

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private searchService: SearchServices,
        private eventHandler: VBEventHandler, private vbCtx: VocbenchCtx, private modalService: ModalServices) {
        
        this.eventSubscriptions.push(eventHandler.contentLangChangedEvent.subscribe(
            newLang => this.onContentLangChanged(newLang)));
    }
    
    ngOnInit() {
        this.ONTO_TYPE = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
        this.activeScheme = this.vbCtx.getScheme();
        this.initList();
    }

    private initList() {
        // this.skosService.getAllSchemesList(this.vbCtx.getContentLanguage(true)).subscribe( //old service
        this.skosService.getAllSchemes().subscribe( //new service
            schemeList => {
                this.schemeList = schemeList;
            }
        );
    }
    
    private createScheme() {
        this.modalService.newResource("Create new skos:ConceptScheme", this.vbCtx.getContentLanguage()).then(
            result => {
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createScheme(result.label, result.lang, result.name, this.vbCtx.getContentLanguage()).subscribe(
                        newScheme => {
                            this.schemeList.push(newScheme);
                        }
                    );
                } else {//SKOSXL
                    this.skosxlService.createScheme(result.label, result.lang, result.name, this.vbCtx.getContentLanguage()).subscribe(
                        newScheme => {
                            this.schemeList.push(newScheme);
                        }
                    );
                }
            },
            () => {}
        );
    }
    
    private deleteScheme() {
        if (this.ONTO_TYPE == "SKOS") {
            this.skosService.deleteScheme(this.selectedScheme).subscribe(
                stResp => this.deleteSchemeRespHandler(stResp),
                err => this.deleteNotEmptySchemeHandler()
            );
        } else { //SKOSXL
            this.skosxlService.deleteScheme(this.selectedScheme).subscribe(
                stResp => this.deleteSchemeRespHandler(stResp),
                err => this.deleteNotEmptySchemeHandler()
            );
        }
    }
    
    private deleteNotEmptySchemeHandler() {
        var retainOpt = "Retain dangling concepts";
        var deleteOpt = "Delete dangling concepts";
        this.modalService.select("Delete scheme", "The operation will produce dangling concepts" 
            + " because the scheme is not empty. What do you want to do?", [retainOpt, deleteOpt]).then(
            selection => {
                var deleteDanglingConc = selection == deleteOpt;
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.deleteScheme(this.selectedScheme, deleteDanglingConc).subscribe(
                        stResp => this.deleteSchemeRespHandler(stResp)
                    );
                } else { //SKOSXL
                    this.skosxlService.deleteScheme(this.selectedScheme, deleteDanglingConc).subscribe(
                        stResp => this.deleteSchemeRespHandler(stResp)
                    );
                }
            },
            () => {}
        );
    }
    
    /**
     * Handles the scheme deletion
     */
    private deleteSchemeRespHandler(stResp) {
        for (var i = 0; i < this.schemeList.length; i++) {//Update the schemeList
            if (this.schemeList[i].getURI() == this.selectedScheme.getURI()) {
                this.schemeList.splice(i, 1);
                break;
            }
        }
        //reset the activeScheme if the deleted was the active one
        if (this.activeScheme != undefined && (this.selectedScheme.getURI() == this.activeScheme.getURI())) {
            this.vbCtx.removeScheme(this.vbCtx.getWorkingProject());
            this.activeScheme = null;
        }
        this.selectedScheme = null;
        this.nodeSelected.emit(undefined);
    }
    
    private activateScheme(scheme: ARTURIResource) {
        //if the scheme that is trying to activate it was already active, pass to no-scheme mode
        if (this.activeScheme != undefined && this.activeScheme.getURI() == scheme.getURI()) {
            this.activeScheme = null;
            this.vbCtx.removeScheme(this.vbCtx.getWorkingProject());
        } else {
            this.activeScheme = scheme;
            this.vbCtx.setScheme(this.activeScheme);
        }
    }
    
    private isActive(scheme: ARTURIResource) {
        return (this.activeScheme && scheme.getURI() == this.activeScheme.getURI());
    }
    
    /**
     * Called when a scheme is clicked. Set the clicked scheme as selected
     */
    private selectScheme(scheme: ARTURIResource) {
        if (this.selectedScheme == undefined) {
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty(ResAttribute.SELECTED, true);
        } else {
            this.selectedScheme.deleteAdditionalProperty(ResAttribute.SELECTED);
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty(ResAttribute.SELECTED, true);
        }
        this.nodeSelected.emit(scheme);
    }

    /**
     * Called when user switches on/off the human readable labels or changes the content language
     */
    private onContentLangChanged(lang: string) {
        //reset the selected node
        this.nodeSelected.emit(undefined);
        //and reinitialize tree
        this.initList();
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
                            console.log("1 result");
                            this.selectScheme(this.getSchemeToSelectFromList(searchResult[0]));
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                selectedResource => {
                                    this.selectScheme(this.getSchemeToSelectFromList(selectedResource));
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

    /**
     * Retrieves from the schemeList the scheme to select. This method is necessary because searchResource service
     * returns a new ARTURIResource that has the same attribute of the one in the schemeList but is not the same object,
     * so I need to invoke selectScheme to the one in the list, not to the one returned from service
     */
    private getSchemeToSelectFromList(scheme: ARTURIResource): ARTURIResource {
        for (var i = 0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].getURI() == scheme.getURI()) {
                return this.schemeList[i];
            }
        }
    }
    
}