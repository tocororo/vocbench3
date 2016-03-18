import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTResource, ARTURIResource, ARTBNode, ARTNode, ARTPredicateObjects} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {PropertyServices} from "../../services/propertyServices";
import {OwlServices} from "../../services/owlServices";

@Component({
	selector: "class-axiom-renderer",
	templateUrl: "app/src/resourceView/renderer/classAxiomPartitionRenderer.html",
	directives: [RdfResourceComponent],
    providers: [OwlServices, PropertyServices],
})
export class ClassAxiomPartitionPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private rdfsSubClassOf = new ARTURIResource("http://www.w3.org/2000/01/rdf-schema#subClassOf", "rdfs:subClassOf", "property");
    private owlEquivalentClass = new ARTURIResource("http://www.w3.org/2002/07/owl#equivalentClass", "owl:equivalentClass", "property");
    private owlDisjointWith = new ARTURIResource("http://www.w3.org/2002/07/owl#disjointWith", "owl:disjointWith", "property");
    private owlComplementOf = new ARTURIResource("http://www.w3.org/2002/07/owl#complementOf", "owl:complementOf", "property");
    private owlIntersectionOf = new ARTURIResource("http://www.w3.org/2002/07/owl#intersectionOf", "owl:intersectionOf", "property");
    private owlOneOf = new ARTURIResource("http://www.w3.org/2002/07/owl#oneOf", "owl:oneOf", "property");
    private owlUnionOf = new ARTURIResource("http://www.w3.org/2002/07/owl#unionOf", "owl:unionOf", "property");
    
    private clsAxiomProperties = [
        this.rdfsSubClassOf, this.owlEquivalentClass, this.owlDisjointWith,
        this.owlComplementOf, this.owlIntersectionOf, this.owlOneOf, this.owlUnionOf
    ];
    
    constructor(private propertyService:PropertyServices, private owlService:OwlServices, private modalService: ModalServices) {}
        
    private add(property: ARTURIResource) {
        switch (property.getURI()) {
            case this.rdfsSubClassOf.getURI():
                alert("add subClassOf to resource " + this.resource.getShow());
                break;
            case this.owlEquivalentClass.getURI():
                alert("add equivalentClass to resource " + this.resource.getShow());
                break;
            case this.owlDisjointWith.getURI():
                alert("add disjointWith to resource " + this.resource.getShow());
                break;
            case this.owlComplementOf.getURI():
                alert("add complementOf to resource " + this.resource.getShow());
                break;
            case this.owlIntersectionOf.getURI():
                alert("add intersectionOf to resource " + this.resource.getShow());
                break;
            case this.owlUnionOf.getURI():
                alert("add unionOf to resource " + this.resource.getShow());
                break;
            case this.owlOneOf.getURI():
                alert("add oneOf to resource " + this.resource.getShow());
                break;
        }
        // this.update.emit(null); //put in subscribe callback
    }
    
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        var objectType = object.isURIResource() ? "uri" : "bnode";
        switch (predicate.getURI()) {
            case this.rdfsSubClassOf.getURI():
                this.owlService.removeSuperCls(this.resource, <ARTURIResource>object).subscribe(
                    stResp => {
                        this.update.emit(null);
                    },
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case this.owlEquivalentClass.getURI():
                this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case this.owlDisjointWith.getURI():
                this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case this.owlComplementOf.getURI():
                this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case this.owlIntersectionOf.getURI():
                this.owlService.removeIntersectionOf(this.resource, object).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case this.owlUnionOf.getURI():
                this.owlService.removeUnionOf(this.resource, object).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case this.owlOneOf.getURI():
                this.owlService.removeOneOf(this.resource, object).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
        }
    }
    
    
    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
    private getAddPropImgSrc(predicate: ARTURIResource) {
        return ResourceUtils.getActionPropImageSrc(predicate, "create");
    }
    
    private getRemovePropImgSrc(predicate: ARTURIResource) {
        return ResourceUtils.getActionPropImageSrc(predicate, "delete");
    }
    
}