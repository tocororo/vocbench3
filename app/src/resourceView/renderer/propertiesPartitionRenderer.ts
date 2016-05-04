import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects} from "../../utils/ARTResources";
import {SKOSXL} from "../../utils/Vocabulary";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {RDFTypesEnum} from "../../utils/Enums";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ResViewModalServices} from "./resViewModals/resViewModalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {PropertyServices} from "../../services/propertyServices";
import {SkosxlServices} from "../../services/skosxlServices";
import {ResourceServices} from "../../services/resourceServices";

@Component({
    selector: "properties-renderer",
    templateUrl: "app/src/resourceView/renderer/predicateObjectListRenderer.html",
    directives: [RdfResourceComponent],
    providers: [PropertyServices, SkosxlServices, ResourceServices, ResViewModalServices],
})
export class PropertiesPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private label = "Properties";
    private addBtnImgSrc = "app/assets/images/prop_create.png";
    private addBtnImgTitle = "Add a property value";
    private removeBtnImgSrc = "app/assets/images/prop_delete.png";
    private removeBtnImgTitle = "Remove property value";
    
    constructor(private propertyService:PropertyServices, private skosxlService: SkosxlServices, private resourceService: ResourceServices,
        private browsingService: BrowsingServices, private modalService: ModalServices, private resViewModalService: ResViewModalServices) {}
        
    private add() {
        this.browsingService.browsePropertyTree("Select a property", this.resource).then(
            selectedProp => {
                this.enrichProperty(selectedProp);
            },
            () => {}
        );
    }
    
    private enrichProperty(predicate: ARTURIResource) {
        //particular cases SKOSXL label
        if (predicate.getURI() == SKOSXL.prefLabel.getURI() || 
            predicate.getURI() == SKOSXL.altLabel.getURI() ||
            predicate.getURI() == SKOSXL.hiddenLabel.getURI()) {
            this.modalService.newPlainLiteral("Add " + predicate.getShow()).then(
                literal => {
                    switch (predicate.getURI()) {
                        case SKOSXL.prefLabel.getURI():
                            this.skosxlService.setPrefLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.bnode).subscribe(
                                stResp => this.update.emit(null),
                                err => { }
                            );
                            break;
                        case SKOSXL.altLabel.getURI():
                            this.skosxlService.addAltLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.bnode).subscribe(
                                stResp => this.update.emit(null),
                                err => { }
                            );
                            break;
                        case SKOSXL.hiddenLabel.getURI():
                            this.skosxlService.addHiddenLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.bnode).subscribe(
                                stResp => this.update.emit(null),
                                err => { }
                            );
                            break;
                    }
                },
                () => {}
            );
        } else { //other cases: handle based the property range
            this.propertyService.getRange(predicate).subscribe(
                range => {
                    var rngType = range.rngType;
                    var ranges = range.ranges;
                    //available values: resource, plainLiteral, typedLiteral, literal, undetermined, inconsistent
                    if (rngType == RDFTypesEnum.resource) {
                        this.enrichWithResource(predicate, ranges);
                    } else if (rngType == RDFTypesEnum.plainLiteral) {
                        this.enrichWithPlainLiteral(predicate);
                    } else if (rngType == RDFTypesEnum.typedLiteral) {
                        var datatypes = [];
                        for (var i = 0; i < ranges.length; i++) {
                            datatypes.push(ranges[i].getNominalValue());
                        }
                        this.enrichWithTypedLiteral(predicate, datatypes);  
                    } else if (rngType == RDFTypesEnum.literal) {
                        var options = [RDFTypesEnum.typedLiteral, RDFTypesEnum.plainLiteral];
                        this.modalService.select("Select range type", null, options).then(
                            selectedRange => {
                                if (selectedRange == RDFTypesEnum.typedLiteral) {
                                    this.enrichWithTypedLiteral(predicate);
                                } else if (selectedRange == RDFTypesEnum.plainLiteral) {
                                    this.enrichWithPlainLiteral(predicate);
                                }
                            },
                            () => {}
                        )
                    } else if (rngType == RDFTypesEnum.undetermined) {
                        var options = [RDFTypesEnum.resource, RDFTypesEnum.typedLiteral, RDFTypesEnum.plainLiteral];
                        this.modalService.select("Select range type", null, options).then(
                            selectedRange => {
                                if (selectedRange == RDFTypesEnum.resource) {
                                    this.enrichWithResource(predicate);
                                } else if (selectedRange == RDFTypesEnum.typedLiteral) {
                                    this.enrichWithTypedLiteral(predicate);
                                } else if (selectedRange == RDFTypesEnum.plainLiteral) {
                                    this.enrichWithPlainLiteral(predicate);
                                }
                            },
                            () => {}
                        )
                    } else if (rngType == "inconsistent") {
                        this.modalService.alert("Error", "Error range of " + predicate.getShow() + " property is inconsistent", "error");
                    }
                }
            );
        }
        // this.update.emit(null);
    }
    
    /**
     * Opens a newPlainLiteral modal to enrich the predicate with a plain literal value 
     */
    private enrichWithPlainLiteral(predicate: ARTURIResource) {
        this.modalService.newPlainLiteral("Add " + predicate.getShow()).then(
            literal => {
                this.propertyService.createAndAddPropValue(
                    this.resource, predicate, literal.value, null, RDFTypesEnum.plainLiteral, literal.lang).subscribe(
                    stResp => { this.update.emit(null) }
                );
            },
            () => { }
        );
    }
    
    /**
     * Opens a newTypedLiteral modal to enrich the predicate with a typed literal value 
     */
    private enrichWithTypedLiteral(predicate: ARTURIResource, allowedDatatypes?: string[]) {
        this.modalService.newTypedLiteral("Add " + predicate.getShow(), allowedDatatypes).then(
            literal => {
                this.propertyService.createAndAddPropValue(
                    this.resource, predicate, literal.value, literal.datatype, RDFTypesEnum.typedLiteral).subscribe(
                    stResp => this.update.emit(null)    
                );
            },
            () => {}
        );
    }
    
    /**
     * Opens a modal to enrich the predicate with a resource 
     */
    private enrichWithResource(predicate: ARTURIResource, resourceTypes?: ARTURIResource[]) {
        this.resViewModalService.enrichProperty("Add " + predicate.getShow(), predicate, resourceTypes).then(
            resource => {
                this.propertyService.addExistingPropValue(
                    this.resource, predicate, resource.getNominalValue(), RDFTypesEnum.resource).subscribe(
                    stResp => this.update.emit(null)
                )
            },
            () => {}
        )
    }
    
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
            stResp => this.update.emit(null)
        );
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