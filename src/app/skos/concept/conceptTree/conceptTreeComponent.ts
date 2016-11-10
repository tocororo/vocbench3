import {Component, Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList} from "@angular/core";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../../utils/ARTResources";
import {VBEventHandler} from "../../../utils/VBEventHandler";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {SkosServices} from "../../../services/skosServices";
import {SearchServices} from "../../../services/searchServices";
import {ConceptTreeNodeComponent} from "./conceptTreeNodeComponent";
import {ModalServices} from "../../../widget/modal/modalServices";

@Component({
    selector: "concept-tree",
    templateUrl: "./conceptTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class ConceptTreeComponent {
    @Input() scheme: ARTURIResource;
    @Input() hideSearch: boolean = false;
    @Input() schemeChangeable: boolean = false;//if true, on top of tree there is a menu that allows to change scheme dynamically
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeCtrlClicked = new EventEmitter<ARTURIResource>();
    @Output() conceptRemovedFromScheme = new EventEmitter<ARTURIResource>();//used to report a concept removed from a scheme
            //only when the scheme is the one used in the current concept tree
    @Output() schemeChanged = new EventEmitter<ARTURIResource>();//when dynamic scheme is changed
    
    //ConceptTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;
    
    //get the element in the view referenced with #blockDivTree
    @ViewChild('blockDivTree') blockDivElement;

    public roots: ARTURIResource[];
    private selectedNode: ARTURIResource;
    
    private schemeList: Array<ARTURIResource>;
    private selectedSchemeUri: string; //needed for the <select> element where I cannot use ARTURIResource as <option> values
        //because I need also a <option> with null value for the no-scheme mode (and it's not possible)
    private workingScheme: ARTURIResource;//keep track of the selected scheme 
        //(useful expecially when schemeChangeable is true so the changes don't effect the scheme in context)

    private eventSubscriptions = [];

    constructor(private skosService: SkosServices, private searchService: SearchServices, private modalService: ModalServices,
        private eventHandler: VBEventHandler, private vbCtx: VocbenchCtx) {
        this.eventSubscriptions.push(eventHandler.topConceptCreatedEvent.subscribe(
            data => this.onTopConceptCreated(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            deletedConcept => this.onConceptDeleted(deletedConcept)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedAsTopConceptEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.contentLangChangedEvent.subscribe(
            newLang => this.onContentLangChanged(newLang)));
    }
    
    ngOnInit() {
        this.workingScheme = this.scheme;
        //init the scheme list if the concept tree allows dynamic change of scheme
        if (this.schemeChangeable) {
            this.skosService.getAllSchemesList().subscribe(
                schemes => {
                    this.schemeList = schemes;
                    if (this.scheme != undefined) {
                        this.selectedSchemeUri = this.scheme.getURI();
                    } else {
                        this.selectedSchemeUri = "---";
                    }
                }
            );
        }
    }
    
    /**
     * Here I use ngAfterViewInit instead of ngOnInit because I need to wait that 
     * the view #blockDivTree is initialized
     */
    ngAfterViewInit() {
        this.initTree();
    }
    
    private initTree() {
        this.blockDivElement.nativeElement.style.display = "block";
        this.skosService.getTopConcepts(this.workingScheme, this.vbCtx.getContentLanguage(true)).subscribe(
            topConcepts => {
                this.roots = topConcepts;
                this.blockDivElement.nativeElement.style.display = "none";
            },
            err => { this.blockDivElement.nativeElement.style.display = "none"; }
        );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], true, true, "contain",
                this.vbCtx.getContentLanguage(true), this.workingScheme).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                selectedResource => {
                                    this.openTreeAt(selectedResource);
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
    
    private openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.concept, this.workingScheme).subscribe(
            path => {
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                //open tree from root to node
                for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                    if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        childrenNodeComponent[i].expandPath(path);
                        break;
                    }
                }
            }
        );
    }
    
    /**
     * Listener to <select> element that allows to change dynamically the scheme of the 
     * concept tree (visible only if @Input schemeChangeable is true).
     */
    private onSchemeChange() {
        this.workingScheme = this.getSchemeResourceFromUri(this.selectedSchemeUri);
        this.initTree();
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
    
    
    //EVENT LISTENERS
    
    private onNodeClicked(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

    private onNodeCtrlClicked(node: ARTURIResource) {
        this.nodeCtrlClicked.emit(node);
    }

    private onTopConceptCreated(concept: ARTURIResource, scheme: ARTURIResource) {
        if (this.scheme == undefined) {//in no-scheme mode add to the root if doesn't already in
            for (var i = 0; i < this.roots.length; i++) {
                if (this.roots[i].getURI() == concept.getURI()) {
                    return; //concept set as top concept already in roots => do not add
                    //this could happen in no-scheme mode when a concept not in scheme is set as topConcept of a scheme
                }
            }
            this.roots.push(concept);
        } else if (this.scheme.getURI() == scheme.getURI()) {//otherwise add it only if it's been created in the current scheme 
            this.roots.push(concept);       
        }
    }

    private onConceptDeleted(deletedConcept: ARTURIResource) {
        //check if the concept to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == deletedConcept.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected node
        this.nodeSelected.emit(undefined);
    }
    
    //data contains "concept" and "scheme"
    private onConceptRemovedFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        if (this.workingScheme != undefined && this.workingScheme.getURI() == scheme.getURI()) {
            for (var i = 0; i < this.roots.length; i++) {
                if (this.roots[i].getURI() == concept.getURI()) {
                    this.roots.splice(i, 1);
                    this.conceptRemovedFromScheme.emit(concept);
                    break;
                }
            }
        }
    }
    
    private onContentLangChanged(lang: string) {
        //reset the selected node
        this.nodeSelected.emit(undefined);
        //and reinitialize tree
        this.initTree();
    }

}