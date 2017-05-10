import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { AbstractTreePanel } from "../../../abstractTreePanel"
import { ConceptTreeComponent } from "../conceptTree/conceptTreeComponent";
import { SkosServices } from "../../../../services/skosServices";
import { SkosxlServices } from "../../../../services/skosxlServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { VBContext } from "../../../../utils/VBContext";
import { VBPreferences } from "../../../../utils/VBPreferences";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
import { CustomForm } from "../../../../models/CustomForms";
import { SKOS } from "../../../../models/Vocabulary";

@Component({
    selector: "concept-tree-panel",
    templateUrl: "./conceptTreePanelComponent.html",
})
export class ConceptTreePanelComponent extends AbstractTreePanel {
    @Input() scheme: ARTURIResource; //if set the concept tree is initialized with this scheme, otherwise with the scheme from VB context
    @Input() schemeChangeable: boolean = false; //if true, above the tree is shown a menu to select a scheme
    @Output() schemeChanged = new EventEmitter<ARTURIResource>();//when dynamic scheme is changed

    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent

    private ONTO_TYPE: string;

    private schemeList: Array<ARTURIResource>;
    private selectedSchemeUri: string; //needed for the <select> element where I cannot use ARTURIResource as <option> values
    //because I need also a <option> with null value for the no-scheme mode (and it's not possible)
    private workingScheme: ARTURIResource;//keep track of the selected scheme: could be assigned throught @Input scheme or scheme selection
    //(useful expecially when schemeChangeable is true so the changes don't effect the scheme in context)


    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private searchService: SearchServices,
        private eventHandler: VBEventHandler, private preferences: VBPreferences, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices) {
        super(cfService, basicModals);

        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (newScheme: ARTURIResource) => this.onSchemeChanged(newScheme)));
    }

    ngOnInit() {
        this.ONTO_TYPE = VBContext.getWorkingProject().getPrettyPrintOntoType();
        if (this.scheme === undefined) { //if @Input is not provided at all, get the scheme from the preferences
            this.workingScheme = this.preferences.getActiveScheme();
        } else { //if @Input scheme is provided (it could be null => no scheme-mode), initialize the tree with this scheme
            this.workingScheme = this.scheme;
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

    createRoot() {
        this.creationModals.newSkosResourceCf("Create new skos:Concept", SKOS.concept, true).then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createTopConcept(res.label, this.workingScheme, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createTopConcept_NEW(res.label, this.workingScheme, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    createChild() {
        this.creationModals.newSkosResourceCf("Create a skos:narrower", SKOS.concept, true).then(
            (res: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (this.ONTO_TYPE == "SKOS") {
                    this.skosService.createNarrower(res.label, this.selectedNode, this.workingScheme, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                } else { //SKOSXL
                    this.skosxlService.createNarrower(res.label, this.selectedNode, this.workingScheme, res.uriResource, res.cls, res.cfId, res.cfValueMap).subscribe(
                        stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                    );
                }
            },
            () => { }
        );
    }

    delete() {
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        if (this.ONTO_TYPE == "SKOS") {
            this.skosService.deleteConcept(this.selectedNode).subscribe(
                stResp => {
                    this.selectedNode = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        } else { //SKOSXL
            this.skosxlService.deleteConcept(this.selectedNode).subscribe(
                stResp => {
                    this.selectedNode = null;
                    this.nodeSelected.emit(undefined);
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                },
                err => { UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement); }
            );
        }
    }

    refresh() {
        this.selectedNode = null;
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

    private getSchemeRendering(scheme: ARTURIResource) {
        return ResourceUtils.getRendering(scheme, this.rendering);
    }

    //search handlers

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            // this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], true, true, "contain", null, this.workingScheme).subscribe(
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], true, true, "contain", 
                this.preferences.getDefaultLanguage(), this.workingScheme).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.viewChildTree.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult).then(
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

    //when a concept is removed from a scheme, it should be still visible in res view,
    //but no more selected in the tree if it was in the current scheme 
    private onConceptRemovedFromScheme(concept: ARTURIResource) {
        this.selectedNode = null;
    }

    private onSchemeChanged(scheme: ARTURIResource) {
        this.workingScheme = scheme;
    }

}