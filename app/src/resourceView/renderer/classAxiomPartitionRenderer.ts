import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTBNode, ARTNode, ARTPredicateObjects} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {PropertyServices} from "../../services/propertyServices";
import {OwlServices} from "../../services/owlServices";

@Component({
	selector: "class-axiom-renderer",
	templateUrl: "app/src/resourceView/renderer/predicateObjectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [ResourceUtils, OwlServices, PropertyServices],
})
export class ClassAxiomPartitionPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();
    
    public label = "Class Axioms";
    public addBtnImgSrc = "app/assets/images/class_create.png";
    public addBtnImgTitle = "Add a class axiom";
    public removeBtnImgSrc = "app/assets/images/class_delete.png";
    public removeBtnImgTitle = "Remove class axiom";
    
    constructor(private propertyService:PropertyServices, private owlService:OwlServices, 
            private eventHandler:VBEventHandler, private resUtils:ResourceUtils) {}
        
    public add() {
        alert("add class axiom to resource " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public enrichProperty(predicate: ARTURIResource) {
        alert("add " + predicate.getShow() + " to resource " + this.resource.getShow());
        //switch between the predicates handled by this Renderer
        // if (predicate.getURI() == "http://www.w3.org/2002/07/owl#equivalentClass") {
        // } else if (predicate.getURI() == "http://www.w3.org/2000/01/rdf-schema#subClassOf") {
        // } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#disjointWith") {
        // } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#complementOf") {
        // } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#intersectionOf") {
        // } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#oneOf") {
        // } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#unionOf") {
        // }
        this.update.emit(null);
    }
    
    public removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        var objectType = object.isURIResource() ? "uri" : "bnode"; 
        //switch between the predicates handled by this Renderer
        if (predicate.getURI() == "http://www.w3.org/2002/07/owl#equivalentClass") {
            this.propertyService.removePropValue(this.resource.getURI(), predicate.getURI(), object.getNominalValue(), null, objectType)
                .subscribe(
                    stResp => this.update.emit(null),
                    err => { alert("Error: " + err); console.error(err.stack);} 
                );
        } else if (predicate.getURI() == "http://www.w3.org/2000/01/rdf-schema#subClassOf") {
            this.owlService.removeSuperCls(this.resource.getURI(), object.getNominalValue())
                .subscribe(
                    stResp => {
                        this.eventHandler.subClassRemovedEvent.emit({parent: object, resource: this.resource});
                        this.update.emit(null);
                    },
                    err => { alert("Error: " + err); console.error(err.stack);} 
                );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#disjointWith") {
            this.propertyService.removePropValue(this.resource.getURI(), predicate.getURI(), object.getNominalValue(), null, objectType)
                .subscribe(
                    stResp => this.update.emit(null),
                    err => { alert("Error: " + err); console.error(err.stack);} 
                );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#complementOf") {
            this.propertyService.removePropValue(this.resource.getURI(), predicate.getURI(), object.getNominalValue(), null, objectType)
                .subscribe(
                    stResp => this.update.emit(null),
                    err => { alert("Error: " + err); console.error(err.stack);} 
                );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#intersectionOf") {
            this.owlService.removeIntersectionOf(this.resource.getURI(), object.getNominalValue())
                .subscribe(
                    stResp => this.update.emit(null),
                    err => { alert("Error: " + err); console.error(err.stack);} 
                );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#oneOf") {
            this.owlService.removeOneOf(this.resource.getURI(), object.getNominalValue())
                .subscribe(
                    stResp => this.update.emit(null),
                    err => { alert("Error: " + err); console.error(err.stack);} 
                );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#unionOf") {
            this.owlService.removeUnionOf(this.resource.getURI(), object.getNominalValue())
                .subscribe(
                    stResp => this.update.emit(null),
                    err => { alert("Error: " + err); console.error(err.stack);} 
                );
        }
    }
    
    
    public getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    public getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
    public getAddPropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "create");
    }
    
    public getRemovePropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "delete");
    }
    
}