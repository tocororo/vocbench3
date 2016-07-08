import {Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList} from "@angular/core";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {OWL} from "../../utils/Vocabulary";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {OwlServices} from "../../services/owlServices";
import {SearchServices} from "../../services/searchServices";
import {ClassTreeNodeComponent} from "./classTreeNodeComponent";

@Component({
	selector: "class-tree",
	templateUrl: "app/src/owl/classTree/classTreeComponent.html",
    directives: [ClassTreeNodeComponent],
    providers: [OwlServices, SearchServices],
    host: { class: "blockingDivHost" }
})
export class ClassTreeComponent {
    @Input('roots') rootClasses: ARTURIResource[];
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    //ClassTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;
    
    //get the element in the view referenced with #blockDivTree
    @ViewChild('blockDivTree') blockDivElement;
    
    public roots:ARTURIResource[] = [];
    private selectedNode:ARTURIResource;
    
    private eventSubscriptions = [];
    
    private viewInitialized: boolean = false;//useful to avoid ngOnChanges calls initTree when the view is not initialized

    constructor(private owlService: OwlServices, private searchService: SearchServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(cls => this.onClassDeleted(cls)));
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
    
    ngOnChanges(changes) {
        //viewInitialized needed to avoid initializing tree before view is initialized
        //(ngOnChanges is called before ngOnInit)
        if (changes.rootClasses && this.viewInitialized) {
            this.initTree();
        }
    }
    
    initTree() {
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
    
    public openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.cls).subscribe(
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
    
}