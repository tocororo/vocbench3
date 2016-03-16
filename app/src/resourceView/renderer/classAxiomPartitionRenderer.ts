import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTResource, ARTURIResource, ARTBNode, ARTNode, ARTPredicateObjects} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ResourceUtils} from "../../utils/ResourceUtils";
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
    
    private label = "Class Axioms";
    private addBtnImgSrc = "app/assets/images/class_create.png";
    private addBtnImgTitle = "Add a class axiom";
    private removeBtnImgSrc = "app/assets/images/class_delete.png";
    private removeBtnImgTitle = "Remove class axiom";
    
    constructor(private propertyService:PropertyServices, private owlService:OwlServices, 
        private resUtils:ResourceUtils, private modalService: ModalServices) {}
        
    private add() {
        alert("add class axiom to resource " + this.resource.getShow());
        this.update.emit(null);
    }
    
    private enrichProperty(predicate: ARTURIResource) {
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
    
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        var objectType = object.isURIResource() ? "uri" : "bnode"; 
        //switch between the predicates handled by this Renderer
        if (predicate.getURI() == "http://www.w3.org/2002/07/owl#equivalentClass") {
            this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2000/01/rdf-schema#subClassOf") {
            this.owlService.removeSuperCls(this.resource, <ARTURIResource>object).subscribe(
                stResp => {
                    this.update.emit(null);
                },
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#disjointWith") {
            this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#complementOf") {
            this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#intersectionOf") {
            this.owlService.removeIntersectionOf(this.resource, object).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#oneOf") {
            this.owlService.removeOneOf(this.resource, object).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2002/07/owl#unionOf") {
            this.owlService.removeUnionOf(this.resource, object).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        }
    }
    
    
    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
    private getAddPropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "create");
    }
    
    private getRemovePropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "delete");
    }
    
}