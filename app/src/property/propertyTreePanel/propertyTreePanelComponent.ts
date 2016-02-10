import {Component, Input, Output, EventEmitter} from "angular2/core";
import {PropertyTreeComponent} from "../../tree/propertyTree/propertyTreeComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {Deserializer} from "../../utils/Deserializer";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "property-tree-panel",
	templateUrl: "app/src/property/propertyTreePanel/propertyTreePanelComponent.html",
	directives: [PropertyTreeComponent],
    providers: [PropertyServices],
})
export class PropertyTreePanelComponent {
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    private selectedProperty:ARTURIResource;
    private eventSubscriptions = [];
    
	constructor(private propService:PropertyServices, private deserializer:Deserializer, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.topPropertyCreatedEvent.subscribe(node => this.onNodeSelected(node)));
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    public createProperty() {
        this.createPropertyForType("rdf:Property");
    }
    
    public createObjectProperty() {
        this.createPropertyForType("owl:ObjectProperty");
    }
    
    public createDatatypeProperty() {
        this.createPropertyForType("owl:DatatypeProperty");
    }
    
    public createAnnotationProperty() {
        this.createPropertyForType("owl:AnnotationProperty");
    }
    
    public createOntologyProperty() {
        this.createPropertyForType("owl:OntologyProperty");
    }
    
    private createPropertyForType(type) {
        var propertyName = prompt("Insert property name");
        if (propertyName == null) return;
        this.propService.addProperty(propertyName, type)
            .subscribe(
                stResp => {
                    var newProp = this.deserializer.createURI(stResp);
                    newProp.setAdditionalProperty("children", []);
                    this.eventHandler.topPropertyCreatedEvent.emit(newProp);       
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    public createSubProperty() {
        var propertyName = prompt("Insert property name");
        if (propertyName == null) return;
        this.propService.addSubProperty(propertyName, this.selectedProperty.getRole(), this.selectedProperty.getURI())
            .subscribe(
                stResp => {
                    var newProp = this.deserializer.createURI(stResp);
                    newProp.setAdditionalProperty("children", []);
                    this.eventHandler.subPropertyCreatedEvent.emit({"resource": newProp, "parent": this.selectedProperty});       
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    public deleteProperty() {
        this.propService.removeProperty(this.selectedProperty.getURI())
            .subscribe(
                stResp => {
                    this.eventHandler.propertyDeletedEvent.emit(this.selectedProperty);
                    this.selectedProperty = null;
                    this.itemSelected.emit(undefined);
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    //EVENT LISTENERS
    
    private onNodeSelected(node:ARTURIResource) {
        this.selectedProperty = node;
        this.itemSelected.emit(node);
    }
    
    
}