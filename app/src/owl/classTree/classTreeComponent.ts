import {Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {OWL} from "../../utils/Vocabulary";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {RDFResourceRolesEnum} from "../../utils/Enums";
import {OwlServices} from "../../services/owlServices";
import {SearchServices} from "../../services/searchServices";
import {ClassTreeNodeComponent} from "./classTreeNodeComponent";
import {ModalServices} from "../../widget/modal/modalServices";

@Component({
	selector: "class-tree",
	templateUrl: "app/src/owl/classTree/classTreeComponent.html",
    directives: [ClassTreeNodeComponent],
    providers: [OwlServices, SearchServices],
    host: { class: "blockingDivHost" }
})
export class ClassTreeComponent {
	@Input('rootclass') rootClass:ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    //ClassTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;
    
    //get the element in the view referenced with #blockDivTree
    @ViewChild('blockDivTree') blockDivElement;
    
    public roots:ARTURIResource[];
    private selectedNode:ARTURIResource;
    
    private eventSubscriptions = [];
	
	constructor(private owlService:OwlServices, private searchService: SearchServices,
            private eventHandler:VBEventHandler, private modalService: ModalServices) {
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(cls => this.onClassDeleted(cls)));
    }
    
    /**
     * Here I use ngAfterViewInit instead of ngOnInit because I need to wait that 
     * the view #blockDivTree is initialized
     */
    ngAfterViewInit() {
        this.blockDivElement.nativeElement.style.display = "block";
        if (this.rootClass == undefined) {
            this.rootClass = OWL.thing;
        }
        this.owlService.getClassesInfoAsRootsForTree(this.rootClass).subscribe(
            roots => {
                this.roots = roots;
            },
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err['stack']);
            },
            () => this.blockDivElement.nativeElement.style.display = "none"
        );
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
        if (this.selectedNode == undefined) {
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);    
        } else {
            this.selectedNode.deleteAdditionalProperty("selected");
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);
        }
        this.itemSelected.emit(node);
    }
    
    private onClassDeleted(cls: ARTURIResource) {
        //check if the class to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == cls.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected item
        this.itemSelected.emit(undefined);
    }
    
}