import {Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef, SimpleChanges} from "@angular/core";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../../utils/ARTResources";
import {OWL} from "../../../utils/Vocabulary";
import {VBEventHandler} from "../../../utils/VBEventHandler";
import {OwlServices} from "../../../services/owlServices";
import {SearchServices} from "../../../services/searchServices";
import {ClassTreeNodeComponent} from "./classTreeNodeComponent";
import {ModalServices} from "../../../widget/modal/modalServices";

@Component({
	selector: "class-tree",
	templateUrl: "./classTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class ClassTreeComponent {
    @Input('roots') rootClasses: ARTURIResource[];
    @Input() hideSearch: boolean = false;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    //ClassTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;
    
    //get the element in the view referenced with #blockDivTree
    @ViewChild('blockDivTree') public blockDivElement: ElementRef;
    
    private roots:ARTURIResource[] = [];
    private selectedNode: ARTURIResource;
    
    private eventSubscriptions: any[] = [];
    
    private viewInitialized: boolean = false;//useful to avoid ngOnChanges calls initTree when the view is not initialized

    constructor(private owlService: OwlServices, private searchService: SearchServices, private modalService: ModalServices,
        private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(
            (cls: ARTURIResource) => this.onClassDeleted(cls)));
    }
    
    /**
     * Here I use ngAfterViewInit instead of ngOnInit because I need to wait that 
     * the view is initialized because in initTree() there is a reference to 
     * #blockDivTree in order to change the display property during the tree creation
     */
    ngAfterViewInit() {
        this.viewInitialized = true;
        this.initTree();
    }
    
    ngOnChanges(changes: SimpleChanges) {
        //viewInitialized needed to avoid initializing tree before view is initialized
        //(ngOnChanges is called before ngOnInit)
        if (changes['rootClasses'] && this.viewInitialized) {
            this.initTree();
        }
    }
    
    initTree() {
        this.selectedNode = null;
        if (this.rootClasses == undefined || this.rootClasses.length == 0) {
            this.rootClasses = [OWL.thing];
        }
        this.roots = [];
        //init info of every root classes (if specified, otherwise just of owl:Thing)
        for (var i = 0; i < this.rootClasses.length; i++) {
            this.blockDivElement.nativeElement.style.display = "block";
            this.owlService.getClassesInfoAsRootsForTree(this.rootClasses[i]).subscribe(
                roots => {
                    this.roots = this.roots.concat(roots);
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        }
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

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
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
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
    
    public openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.cls).subscribe(
            path => {
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                //open tree from root to node
                for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                    if (path[0].getURI() != OWL.thing.getURI() && childrenNodeComponent[i].node.getURI() == OWL.thing.getURI()) {
                        /* Workaround to resolve an issue:
                        some classes (e.g. skos:Concept, skos:Collection,...) are visible in class tree of SKOS projects,
                        but they are not subClassOf owl:Thing, so getPathFromRoot does not return the path up to owl:Thing.
                        Here I perform a check to skip this scenario. If first node of path is not owl:Thing, I expand owl:Thing
                        anyway when encountered in this for loop (without splice the first node of the path). */
                        childrenNodeComponent[i].expandPath(path);
                        break;
                    } else if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        childrenNodeComponent[i].expandPath(path);
                        break;
                    }
                }
            }
        );
    }
    
    
    //EVENT LISTENERS
    
    private onNodeSelected(node:ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }
    
    private onClassDeleted(cls: ARTURIResource) {
        //check if the class to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == cls.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected node
        this.nodeSelected.emit(undefined);
    }
    
    //Listeners to node expansion start/end. Simply show/hide the loading div
    private onNodeExpandStart() {
        this.blockDivElement.nativeElement.style.display = "block";
    }
    private onNodeExpandEnd() {
        this.blockDivElement.nativeElement.style.display = "none";
    }

}