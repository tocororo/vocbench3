import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTResource, ARTURIResource, ARTBNode, ARTNode, ARTPredicateObjects} from "../../utils/ARTResources";
import {RDFS, OWL} from "../../utils/Vocabulary";
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
    
    private clsAxiomProperties = [
        RDFS.subClassOf, OWL.equivalentClass, OWL.disjointWith, OWL.complementOf, 
        OWL.intersectionOf, OWL.oneOf, OWL.unionOf
    ];
    
    constructor(private propertyService:PropertyServices, private owlService:OwlServices, private modalService: ModalServices) {}
        
    private add(property: ARTURIResource) {
        switch (property.getURI()) {
            case RDFS.subClassOf.getURI():
                alert("add subClassOf to resource " + this.resource.getShow());
                break;
            case OWL.equivalentClass.getURI():
                alert("add equivalentClass to resource " + this.resource.getShow());
                break;
            case OWL.disjointWith.getURI():
                alert("add disjointWith to resource " + this.resource.getShow());
                break;
            case OWL.complementOf.getURI():
                alert("add complementOf to resource " + this.resource.getShow());
                break;
            case OWL.intersectionOf.getURI():
                alert("add intersectionOf to resource " + this.resource.getShow());
                break;
            case OWL.unionOf.getURI():
                alert("add unionOf to resource " + this.resource.getShow());
                break;
            case OWL.unionOf.getURI():
                alert("add oneOf to resource " + this.resource.getShow());
                break;
        }
        // this.update.emit(null); //put in subscribe callback
    }
    
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        var objectType = object.isURIResource() ? "uri" : "bnode";
        switch (predicate.getURI()) {
            case RDFS.subClassOf.getURI():
                this.owlService.removeSuperCls(this.resource, <ARTURIResource>object).subscribe(
                    stResp => {
                        this.update.emit(null);
                    },
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case OWL.equivalentClass.getURI():
                this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case OWL.disjointWith.getURI():
                this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case OWL.complementOf.getURI():
                this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, objectType).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case OWL.intersectionOf.getURI():
                this.owlService.removeIntersectionOf(this.resource, object).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case OWL.unionOf.getURI():
                this.owlService.removeUnionOf(this.resource, object).subscribe(
                    stResp => this.update.emit(null),
                    err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
                );
                break;
            case OWL.unionOf.getURI():
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