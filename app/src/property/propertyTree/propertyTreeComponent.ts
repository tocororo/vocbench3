import {Component, Input, Output, EventEmitter, ViewChildren, QueryList} from "@angular/core";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {PropertyServices} from "../../services/propertyServices";
import {SearchServices} from "../../services/searchServices";
import {PropertyTreeNodeComponent} from "./propertyTreeNodeComponent";

@Component({
	selector: "property-tree",
	templateUrl: "app/src/property/propertyTree/propertyTreeComponent.html",
    directives: [PropertyTreeNodeComponent],
})
export class PropertyTreeComponent {
    @Input() resource: ARTURIResource;//provided to show just the properties with domain the type of the resource 
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    
    //PropertyTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;
    
    private propertyTree: ARTURIResource[];
    private selectedNode: ARTURIResource;
    
    private eventSubscriptions = [];
	
	constructor(private propertyService:PropertyServices, private searchService: SearchServices, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.topPropertyCreatedEvent.subscribe(node => this.onTopPropertyCreated(node)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(property => this.onPropertyDeleted(property)));
        this.eventSubscriptions.push(eventHandler.subPropertyCreatedEvent.subscribe(
            data => this.onSubPropertyCreated(data.subProperty, data.superProperty)));
        this.eventSubscriptions.push(eventHandler.superPropertyAddedEvent.subscribe(
            data => this.onSuperPropertyAdded(data.subProperty, data.superProperty)));
    }
    
    /**
     * Following check needed to avoid to call 2 times the service if the @Input resource is provided:
     * - 1st time in ngOnChanges when resource is binded (so changes value)
     * - 2nd time here in ngOnInit
     * I cannot resolve by deleting this method since if @Input resource is not provided at all,
     * ngOnChanges is not called
     */
    ngOnInit() {
        if (this.propertyTree == undefined) {
            this.initTree();
        }
    }
    
    /**
     * Called when @Input resource changes, reinitialize the tree
     */
    ngOnChanges(changes) {
        if (changes.resource) {
            this.propertyTree = []; //so ngOnInit will not be called a 2nd time
            this.initTree();
        }
    }
    
    private initTree() {
        this.propertyService.getPropertiesTree(this.resource).subscribe(
            propertyTree => {
                this.propertyTree = propertyTree;
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
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
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
        //reset the selected node
        this.nodeSelected.emit(undefined);
    }

    private onSubPropertyCreated(subProperty: ARTURIResource, superProperty: ARTURIResource) {
        //if the subProperty was a root property, should be removed from the root array (propertyTree)
        //check if the property to delete is a topProperty
        for (var i = 0; i < this.propertyTree.length; i++) {
            if (this.propertyTree[i].getURI() == subProperty.getURI()) {
                this.propertyTree.splice(i, 1);
                break;
            }
        }
    }

    private onSuperPropertyAdded(subProperty: ARTURIResource, superProperty: ARTURIResource) {
        //if the superProperty is a root property add subProperty to its children
        for (var i = 0; i < this.propertyTree.length; i++) {
            if (this.propertyTree[i].getURI() == superProperty.getURI()) {
                this.propertyTree[i].getAdditionalProperty(ResAttribute.CHILDREN).push(subProperty);
                this.propertyTree[i].setAdditionalProperty(ResAttribute.MORE, 1);
                break;
            }
        }
    }
    
}