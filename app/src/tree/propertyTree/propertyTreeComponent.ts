import {Component, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {PropertyServices} from "../../services/propertyServices";
import {PropertyTreeNodeComponent} from "./propertyTreeNodeComponent";

@Component({
	selector: "property-tree",
	templateUrl: "app/src/tree/propertyTree/propertyTreeComponent.html",
    providers: [PropertyServices],
    directives: [PropertyTreeNodeComponent],
})
export class PropertyTreeComponent {
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    private propertyTree: ARTURIResource[] = [];
    private selectedNode:ARTURIResource;
    
    private eventSubscriptions = [];
	
	constructor(private propertyService:PropertyServices, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.propertyTreeNodeSelectedEvent.subscribe(node => this.onPropertySelected(node)));
        this.eventSubscriptions.push(eventHandler.topPropertyCreatedEvent.subscribe(node => this.onTopPropertyCreated(node)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(propertyURI => this.onPropertyDeleted(propertyURI)));
    }
    
    ngOnInit() {
        this.propertyService.getPropertiesTree()
            .subscribe(
                propertyTree => {
                    this.propertyTree = propertyTree;
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
    
    //EVENT LISTENERS
    
    private onPropertySelected(node:ARTURIResource) {
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
    
    private onTopPropertyCreated(property:ARTURIResource) {
        this.propertyTree.push(property);
    }
    
    private onPropertyDeleted(propertyURI: string) {
        //check if the property to delete is a topProperty
        for (var i = 0; i < this.propertyTree.length; i++) {
            if (this.propertyTree[i].getURI() == propertyURI) {
                this.propertyTree.splice(i, 1);
                break;
            }
        }
        //reset the selected item
        this.itemSelected.emit(undefined);
    }
    
}