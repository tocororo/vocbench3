import {Component, OnInit} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {PropertyServices} from "../../services/propertyServices";
import {PropertyTreeNodeComponent} from "./propertyTreeNodeComponent";

@Component({
	selector: "property-tree",
	templateUrl: "app/src/tree/propertyTree/propertyTreeComponent.html",
    providers: [PropertyServices],
    directives: [PropertyTreeNodeComponent],
})
export class PropertyTreeComponent implements OnInit {
    
    public propertyTree: ARTURIResource[] = [];
    private selectedNode:ARTURIResource;
    
    private eventSubscriptions = [];
	
	constructor(private propertyService:PropertyServices, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.propertyTreeNodeSelectedEvent.subscribe(node => this.onPropertySelected(node)));
        this.eventSubscriptions.push(eventHandler.topPropertyCreatedEvent.subscribe(node => this.onTopPropertyCreated(node)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(node => this.onPropertyDeleted(node)));
    }
    
    ngOnInit() {
        this.propertyService.getPropertiesTree()
            .subscribe(
                stResp => {
                    var propertiesXml = stResp.querySelectorAll("data > Property");
                    for (var i=0; i<propertiesXml.length; i++) {
                        var p = this.parseProperty(propertiesXml[i]);
                        this.propertyTree.push(p);
                    }
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    private parseProperty(propXml): ARTURIResource {
        var show = propXml.getAttribute("name");
        var role = propXml.getAttribute("type");
        var uri = propXml.getAttribute("uri");
        var deleteForbidden = propXml.getAttribute("deleteForbidden") == "true";
        var p = new ARTURIResource(uri, show, role);
        p.setAdditionalProperty("deleteForbidden", deleteForbidden);
        //recursively parse children
        var subProperties: ARTURIResource[] = [];
        var subPropsXml = propXml.querySelectorAll(":scope > SubProperties > Property");
        for (var i=0; i<subPropsXml.length; i++) {
            var subP = this.parseProperty(subPropsXml[i]);
            subProperties.push(subP);
        }
        p.setAdditionalProperty("children", subProperties);
        return p;
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
    }
    
    private onTopPropertyCreated(property:ARTURIResource) {
        this.propertyTree.push(property);
    }
    
    private onPropertyDeleted(property:ARTURIResource) {
        //check if the property to delete is a topProperty
        for (var i = 0; i < this.propertyTree.length; i++) {
            if (this.propertyTree[i].getURI() == property.getURI()) {
                this.propertyTree.splice(i, 1);
                break;
            }
        }
    }
    
}