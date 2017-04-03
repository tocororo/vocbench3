import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { ConceptTreeComponent } from "../conceptTree/conceptTreeComponent";
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { SearchServices } from "../../../../services/searchServices";
import { ModalServices } from "../../../../widget/modal/modalServices";
import { VBContext } from "../../../../utils/VBContext";
import { VBPreferences } from "../../../../utils/VBPreferences";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";

@Component({
    selector: "concept-tree-panel",
    templateUrl: "./conceptTreePanelComponent.html",
})
export class ConceptTreePanelComponent {
    @Input() editable: boolean = true; //if true show the buttons to edit the tree
    @Input() scheme: ARTURIResource; //if set the concept tree is initialized with this scheme, otherwise with the scheme from VB context
    @Input() schemeChangeable: boolean = false; //if true, above the tree is shown a menu to select a scheme
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() schemeChanged = new EventEmitter<ARTURIResource>();//when dynamic scheme is changed

    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent

    private ONTO_TYPE: string;

    private rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedConcept: ARTURIResource;

    private schemeList: Array<ARTURIResource>;
    private selectedSchemeUri: string; //needed for the <select> element where I cannot use ARTURIResource as <option> values
    //because I need also a <option> with null value for the no-scheme mode (and it's not possible)
    private workingScheme: ARTURIResource;//keep track of the selected scheme: could be assigned throught @Input scheme or scheme selection
    //(useful expecially when schemeChangeable is true so the changes don't effect the scheme in context)

    private eventSubscriptions: any[] = [];

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private searchService: SearchServices,
        private modalService: ModalServices, private eventHandler: VBEventHandler, private preferences: VBPreferences) {
        
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (newScheme: ARTURIResource) => this.onSchemeChanged(newScheme)));
    }

    ngOnInit() {
        this.ONTO_TYPE = VBContext.getWorkingProject().getPrettyPrintOntoType();
        if (this.scheme != undefined) { //if @Input scheme is provided, initialize the tree with this scheme
            this.workingScheme = this.scheme;
        } else { //otherwise get the scheme from the preferences
            this.workingScheme = this.preferences.getActiveScheme();
        }

        //init the scheme list if the concept tree allows dynamic change of scheme
        if (this.schemeChangeable) {
            this.skosService.getAllSchemes().subscribe( //new service
                schemes => {
                    this.schemeList = schemes;
                    if (this.workingScheme != null) {
                        this.selectedSchemeUri = this.workingScheme.getURI();
                    } else {
                        this.selectedSchemeUri = "---";
                    }
                }
            );
        }
    }

    //top bar commands handlers

    private createTopConcept() {
        this.modalService.newResource("Create new skos:Concept").then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createTopConcept(res.label, res.lang, this.workingScheme, res.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createTopConcept(res.label, res.lang, this.workingScheme, res.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private createNarrower() {
        this.modalService.newResource("Create a skos:narrower").then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNarrower(res.label, res.lang, this.selectedConcept, this.workingScheme, res.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createNarrower(res.label, res.lang, this.selectedConcept, this.workingScheme, res.uri).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
                        err => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    private deleteConcept() {
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        if (this.ONTO_TYPE == "SKOS") {
            this.skosService.deleteConcept(this.selectedConcept).subscribe(
                stResp => {
                    this.selectedConcept = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        } else { //SKOSXL
            this.skosxlService.deleteConcept(this.selectedConcept).subscribe(
                stResp => {
                    this.selectedConcept = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        }
    }

    private refresh() {
        this.selectedConcept = null;
        this.viewChildTree.initTree();
    }

    //scheme selection menu handlers

    /**
     * Listener to <select> element that allows to change dynamically the scheme of the
     * concept tree (visible only if @Input schemeChangeable is true).
     */
    private onSchemeSelectionChange() {
        this.workingScheme = this.getSchemeResourceFromUri(this.selectedSchemeUri);
        // this.initTree();
        this.schemeChanged.emit(this.workingScheme);
    }

    /**
     * Retrieves the ARTURIResource of a scheme URI from the available scheme. Returns null
     * if the URI doesn't represent a scheme in the list.
     */
    private getSchemeResourceFromUri(schemeUri: string): ARTURIResource {
        for (var i = 0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].getURI() == schemeUri) {
                return this.schemeList[i];
            }
        }
        return null; //schemeUri was probably "---", so for no-scheme mode return a null object
    }

    //search handlers

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            // this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], true, true, "contain", null, this.workingScheme).subscribe(
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], true, true, "contain", null, this.workingScheme).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.viewChildTree.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.viewChildTree.openTreeAt(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    //EVENT LISTENERS
    private onNodeSelected(node: ARTURIResource) {
        this.selectedConcept = node;
        this.nodeSelected.emit(node);
    }

    //when a concept is removed from a scheme, it should be still visible in res view,
    //but no more selected in the tree if it was in the current scheme 
    private onConceptRemovedFromScheme(concept: ARTURIResource) {
        this.selectedConcept = null;
    }

    private onSchemeChanged(scheme: ARTURIResource) {
        this.workingScheme = scheme;
    }

}