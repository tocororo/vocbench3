import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects} from "../../utils/ARTResources";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {SkosServices} from "../../services/skosServices";
import {SkosxlServices} from "../../services/skosxlServices";
import {OwlServices} from "../../services/owlServices";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "lexicalizations-renderer",
	templateUrl: "app/src/resourceView/renderer/predicateObjectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [SkosServices, SkosxlServices, OwlServices, PropertyServices, ResourceUtils],
})
export class LexicalizationsPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private label = "Lexicalizations";
    private addBtnImgSrc = "app/assets/images/propAnnotation_create.png";
    private addBtnImgTitle = "Add a lexicalization";
    private removeBtnImgSrc = "app/assets/images/propAnnotation_delete.png";
    private removeBtnImgTitle = "Remove lexicalization";
    
    constructor(private skosService:SkosServices, private owlService:OwlServices, private skosxlService: SkosxlServices,
        private propertyService:PropertyServices, private resUtils:ResourceUtils, private modalService: ModalServices) {}
    
    private add() {
        alert("add lexicalization to resource " + this.resource.getShow());
        //this should allow to choose a lexicalization to enrich
        this.update.emit(null);
    }
    
    private enrichProperty(predicate: ARTURIResource) {
        this.modalService.newLiteralLang("Add " + predicate.getShow()).then(
            result => {
                switch (predicate.getURI()) {
                    case "http://www.w3.org/2008/05/skos-xl#prefLabel":
                        this.skosxlService.setPrefLabel(this.resource, result.literal, result.lang, "bnode").subscribe(
                            stResp => this.update.emit(null),
                            err => {
                                this.modalService.alert("Error", err, "error");
                                console.error(err['stack']);
                            }
                        );
                        break;
                    case "http://www.w3.org/2008/05/skos-xl#altLabel":
                        this.skosxlService.addAltLabel(this.resource, result.literal, result.lang, "bnode").subscribe(
                            stResp => this.update.emit(null),
                            err => {
                                this.modalService.alert("Error", err, "error");
                                console.error(err['stack']);
                            }
                        );
                        break;
                    case "http://www.w3.org/2008/05/skos-xl#hiddenLabel":
                        this.skosxlService.addHiddenLabel(this.resource, result.literal, result.lang, "bnode").subscribe(
                            stResp => this.update.emit(null),
                            err => {
                                this.modalService.alert("Error", err, "error");
                                console.error(err['stack']);
                            }
                        );
                        break;
                    case "http://www.w3.org/2004/02/skos/core#prefLabel":
                        this.skosService.setPrefLabel(this.resource, result.literal, result.lang).subscribe(
                            stResp => this.update.emit(null),
                            err => {
                                this.modalService.alert("Error", err, "error");
                                console.error(err['stack']);
                            }
                        );
                        break;
                    case "http://www.w3.org/2004/02/skos/core#altLabel":
                        this.skosService.addAltLabel(this.resource, result.literal, result.lang).subscribe(
                            stResp => this.update.emit(null),
                            err => {
                                this.modalService.alert("Error", err, "error");
                                console.error(err['stack']);
                            }
                        );
                        break;
                    case "http://www.w3.org/2004/02/skos/core#hiddenLabel":
                        this.skosService.addHiddenLabel(this.resource, result.literal, result.lang).subscribe(
                            stResp => this.update.emit(null),
                            err => {
                                this.modalService.alert("Error", err, "error");
                                console.error(err['stack']);
                            }
                        );
                        break;
                    case "http://www.w3.org/2000/01/rdf-schema#label":
                        this.propertyService.createAndAddPropValue(
                            this.resource, predicate, result.literal, null, "plainLiteral", result.lang).subscribe(
                            stResp => this.update.emit(null),
                            err => {
                                this.modalService.alert("Error", err, "error");
                                console.error(err['stack']);
                            }
                        );
                        break;
                }
            }
        );
    }
    
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getURI() == "http://www.w3.org/2008/05/skos-xl#prefLabel") {
            this.skosxlService.removePrefLabel(this.resource, object.getShow(), object.getAdditionalProperty("lang")).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2008/05/skos-xl#altLabel") {
            this.skosxlService.removeAltLabel(this.resource, object.getShow(), object.getAdditionalProperty("lang")).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2008/05/skos-xl#hiddenLabel") {
            this.skosxlService.removeHiddenLabel(this.resource, object.getShow(), object.getAdditionalProperty("lang")).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2004/02/skos/core#prefLabel") {
            this.skosService.removePrefLabel(this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2004/02/skos/core#altLabel") {
            this.skosService.removeAltLabel(this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2004/02/skos/core#hiddenLabel") {
            this.skosService.removeHiddenLabel(this.resource, (<ARTLiteral>object).getLabel(), (<ARTLiteral>object).getLang()).subscribe(
                stResp => this.update.emit(null),
                err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
            );
        } else if (predicate.getURI() == "http://www.w3.org/2000/01/rdf-schema#label") {
            this.propertyService.removePropValue(this.resource, predicate, (<ARTLiteral>object).getLabel(),
                null, "plainLiteral", (<ARTLiteral>object).getLang()).subscribe(
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