import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFTypesEnum} from "../../utils/ARTResources";
import {SKOSXL} from "../../utils/Vocabulary";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {CustomRange, CustomRangeEntry} from "../../utils/CustomRanges";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ReifiedResourceComponent} from "../../widget/reifiedResource/reifiedResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ResViewModalServices} from "./resViewModals/resViewModalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {PropertyServices} from "../../services/propertyServices";
import {SkosxlServices} from "../../services/skosxlServices";
import {ResourceServices} from "../../services/resourceServices";
import {CustomRangeServices} from "../../services/customRangeServices";

@Component({
    selector: "properties-renderer",
    templateUrl: "app/src/resourceView/renderer/predicateObjectListRenderer.html",
    directives: [RdfResourceComponent, ReifiedResourceComponent],
    providers: [PropertyServices, SkosxlServices, ResourceServices, ResViewModalServices, CustomRangeServices,
        BrowsingServices],
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
        private browsingService: BrowsingServices, private modalService: ModalServices, private resViewModalService: ResViewModalServices,
        private customRangeService: CustomRangeServices) {}
        
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
                            this.skosxlService.setPrefLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                        case SKOSXL.altLabel.getURI():
                            this.skosxlService.addAltLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                        case SKOSXL.hiddenLabel.getURI():
                            this.skosxlService.addHiddenLabel(this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                                stResp => this.update.emit(null)
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
                    var customRanges: CustomRange = range.customRanges;
                    if (customRanges == undefined) { //just "classic" range
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
                    } else { //both "classic" and custom range
                        var rangeOptions = [];//prepare the range options...
                        var crEntries = customRanges.getEntries();
                        //...with the custom range entries
                        for (var i = 0; i < crEntries.length; i++) {
                            rangeOptions.push({value: crEntries[i].getName(), description: crEntries[i].getDescription()});
                        }
                        //...and the classic ranges
                        if (rngType == RDFTypesEnum.resource || rngType == RDFTypesEnum.plainLiteral || rngType == RDFTypesEnum.typedLiteral) {
                            rangeOptions.push({value: rngType, description: rngType});
                        } else if (rngType == RDFTypesEnum.literal) {
                            rangeOptions.push({value: RDFTypesEnum.plainLiteral, description: RDFTypesEnum.plainLiteral});
                            rangeOptions.push({value: RDFTypesEnum.typedLiteral, description: RDFTypesEnum.typedLiteral});
                        } else if (rngType == RDFTypesEnum.undetermined) {
                            rangeOptions.push({value: RDFTypesEnum.resource, description: RDFTypesEnum.resource});
                            rangeOptions.push({value: RDFTypesEnum.plainLiteral, description: RDFTypesEnum.plainLiteral});
                            rangeOptions.push({value: RDFTypesEnum.typedLiteral, description: RDFTypesEnum.typedLiteral});
                        }
                        //ask the user to choose
                        this.modalService.select("Select range type", null, rangeOptions, true).then(
                            selectedRange => {
                                //check if selected range is one of the customs
                                for (var i = 0; i < crEntries.length; i++) {
                                    if (selectedRange == crEntries[i].getName()) {
                                        this.enrichWithCustomRange(crEntries[i]);
                                        return;
                                    }
                                }
                                if (selectedRange == RDFTypesEnum.resource) {
                                    this.enrichWithResource(predicate);
                                } else if (selectedRange == RDFTypesEnum.typedLiteral) {
                                    this.enrichWithTypedLiteral(predicate);
                                } else if (selectedRange == RDFTypesEnum.plainLiteral) {
                                    this.enrichWithPlainLiteral(predicate);
                                }
                            },
                            () => { }
                        )
                    }
                }
            );
        }
    }
    
    private enrichWithCustomRange(crEntry: CustomRangeEntry) {
        this.customRangeService.getCustomRangeEntryForm(crEntry.getId()).subscribe(
            form => {
                alert("opening custom form for entry: " + JSON.stringify(form));
            }
        )
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
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.customRangeService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            )
        } else {
            this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }
    
    /**
     * Tells if the given object need to be rendered as reifiedResource or as simple rdfResource.
     * A resource should be rendered as reifiedResource if the predicate has custom range and the object
     * is an ARTBNode or an ARTURIResource (so a reifiable object). Otherwise, if the object is a literal
     * or the predicate has no custom range, the object should be rendered as simple rdfResource
     * @param object object of the predicate object list to render in view.
     */
    private renderAsReified(predicate: ARTURIResource, object: ARTNode) {
        return (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource());
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