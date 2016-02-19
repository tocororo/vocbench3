import {Component, Input, Output, EventEmitter, ViewChildren, QueryList} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {OwlServices} from "../../services/owlServices";
import {SearchServices} from "../../services/searchServices";
import {ClassTreeNodeComponent} from "./classTreeNodeComponent";

@Component({
	selector: "class-tree",
	templateUrl: "app/src/tree/classTree/classTreeComponent.html",
    directives: [ClassTreeNodeComponent],
    providers: [OwlServices, SearchServices],
})
export class ClassTreeComponent {
	@Input('rootclass') rootClass:ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    //ClassTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;
    
    public roots:ARTURIResource[];
    private selectedNode:ARTURIResource;
    
    private eventSubscriptions = [];
	
	constructor(private owlService:OwlServices, private searchService: SearchServices, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.classTreeNodeSelectedEvent.subscribe(node => this.onClassSelected(node)));
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(classURI => this.onClassDeleted(classURI)));
    }
    
    ngOnInit() {
        var rootClassUri = null;
        if (this.rootClass == undefined) {
            rootClassUri = "http://www.w3.org/2002/07/owl#Thing";
        } else {
            rootClassUri = this.rootClass.getURI();
        }
        this.owlService.getClassesInfoAsRootsForTree(rootClassUri)
            .subscribe(
                roots => {
                    this.roots = roots;
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err['stack']);
                }
            );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    public openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node.getURI(), "class").subscribe(
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
    
    private onClassSelected(node:ARTURIResource) {
        if (this.selectedNode == undefined) {
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);    
        } else if (this.selectedNode.getURI() != node.getURI()) {
            this.selectedNode.deleteAdditionalProperty("selected");
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);
        }
        this.itemSelected.emit(node);
    }
    
    private onClassDeleted(classURI: string) {
        //check if the class to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == classURI) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected item
        this.itemSelected.emit(undefined);
    }
    
}