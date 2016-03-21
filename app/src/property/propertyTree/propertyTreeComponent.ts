import {Component, Output, EventEmitter, ViewChildren, QueryList} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {RDFResourceRolesEnum} from "../../utils/Enums";
import {ModalServices} from "../../widget/modal/modalServices";
import {PropertyServices} from "../../services/propertyServices";
import {SearchServices} from "../../services/searchServices";
import {PropertyTreeNodeComponent} from "./propertyTreeNodeComponent";

@Component({
	selector: "property-tree",
	templateUrl: "app/src/property/propertyTree/propertyTreeComponent.html",
    providers: [PropertyServices, SearchServices],
    directives: [PropertyTreeNodeComponent],
})
export class PropertyTreeComponent {
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    //PropertyTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;
    
    private propertyTree: ARTURIResource[] = [];
    private selectedNode:ARTURIResource;
    
    private eventSubscriptions = [];
	
	constructor(private propertyService:PropertyServices, private searchService: SearchServices, 
            private eventHandler:VBEventHandler, private modalService: ModalServices) {
        this.eventSubscriptions.push(eventHandler.topPropertyCreatedEvent.subscribe(node => this.onTopPropertyCreated(node)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(property => this.onPropertyDeleted(property)));
    }
    
    ngOnInit() {
        this.propertyService.getPropertiesTree().subscribe(
            propertyTree => {
                this.propertyTree = propertyTree;
            },
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err['stack']);
            }
        );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    public openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.property).subscribe(
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
    
    private onTopPropertyCreated(property:ARTURIResource) {
        this.propertyTree.push(property);
    }
    
    private onPropertyDeleted(property: ARTURIResource) {
        //check if the property to delete is a topProperty
        for (var i = 0; i < this.propertyTree.length; i++) {
            if (this.propertyTree[i].getURI() == property.getURI()) {
                this.propertyTree.splice(i, 1);
                break;
            }
        }
        //reset the selected item
        this.itemSelected.emit(undefined);
    }
    
}