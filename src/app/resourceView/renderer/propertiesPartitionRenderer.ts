import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectsListRenderer } from "./abstractPredicateObjectsListRenderer";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../utils/ARTResources";
import { SKOSXL } from "../../utils/Vocabulary";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { CustomRange, CustomRangeEntry } from "../../utils/CustomRanges";
import { ModalServices } from "../../widget/modal/modalServices";


@Component({
    selector: "properties-renderer",
    templateUrl: "./predicateObjectsListRenderer.html",
})
export class PropertiesPartitionRenderer extends AbstractPredicateObjectsListRenderer {

    //inherited from AbstractPredicateObjectsListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = null; //there is no root property for this partition
    label = "Properties";
    addBtnImgSrc = require("../../../assets/images/prop_create.png");
    addBtnImgTitle = "Add a property value";
    removeBtnImgTitle = "Remove property value";

    constructor(private propService: PropertyServices, private resourceService: ResourceServices, private crService: CustomRangeServices,
        private skosxlService: SkosxlServices, private browsingService: BrowsingServices, private modalService: ModalServices,
        private resViewModalService: ResViewModalServices) {
        super();
    }

    ngOnInit() {
        this.partitionCollapsed = (this.predicateObjectList.length > 4);
    }

    add(predicate?: ARTURIResource) {
        if (predicate != undefined) {
            this.enrichProperty(predicate);
        } else {
            this.browsingService.browsePropertyTree("Select a property", null, <ARTURIResource>this.resource).then(
                (selectedProp: any) => {
                    this.enrichProperty(selectedProp);
                },
                () => { }
            );
        }
    }

    private enrichProperty(predicate: ARTURIResource) {
        //particular cases SKOSXL label
        if (predicate.getURI() == SKOSXL.prefLabel.getURI() ||
            predicate.getURI() == SKOSXL.altLabel.getURI() ||
            predicate.getURI() == SKOSXL.hiddenLabel.getURI()) {
            this.modalService.newPlainLiteral("Add " + predicate.getShow()).then(
                (literal: any) => {
                    switch (predicate.getURI()) {
                        case SKOSXL.prefLabel.getURI():
                            this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                        case SKOSXL.altLabel.getURI():
                            this.skosxlService.addAltLabel(<ARTURIResource>this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                        case SKOSXL.hiddenLabel.getURI():
                            this.skosxlService.addHiddenLabel(<ARTURIResource>this.resource, literal.value, literal.lang, RDFTypesEnum.uri).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                    }
                },
                () => { }
            );
        } else { //other cases: handle based the property range
            this.propService.getRange(predicate).subscribe(
                range => {
                    var rngType = range.rngType;
                    var ranges = range.ranges;
                    var customRanges: CustomRange[] = range.customRanges;
                    if (customRanges.length == 0) { //just "classic" range
                        //available values: resource, plainLiteral, typedLiteral, literal, undetermined, inconsistent
                        if (rngType == RDFTypesEnum.resource) {
                            this.enrichWithResource(predicate, ranges);
                        } else if (rngType == RDFTypesEnum.plainLiteral) {
                            this.enrichWithPlainLiteral(predicate);
                        } else if (rngType == RDFTypesEnum.typedLiteral) {
                            var datatypes: string[] = [];
                            for (var i = 0; i < ranges.length; i++) {
                                datatypes.push(ranges[i].getNominalValue());
                            }
                            this.enrichWithTypedLiteral(predicate, datatypes);
                        } else if (rngType == RDFTypesEnum.literal) {
                            var options = [RDFTypesEnum.typedLiteral, RDFTypesEnum.plainLiteral];
                            this.modalService.select("Select range type", null, options).then(
                                (selectedRange: any) => {
                                    if (selectedRange == RDFTypesEnum.typedLiteral) {
                                        this.enrichWithTypedLiteral(predicate);
                                    } else if (selectedRange == RDFTypesEnum.plainLiteral) {
                                        this.enrichWithPlainLiteral(predicate);
                                    }
                                },
                                () => { }
                            )
                        } else if (rngType == RDFTypesEnum.undetermined) {
                            var options = [RDFTypesEnum.resource, RDFTypesEnum.typedLiteral, RDFTypesEnum.plainLiteral];
                            this.modalService.select("Select range type", null, options).then(
                                (selectedRange: any) => {
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
                        } else if (rngType == "inconsistent") {
                            this.modalService.alert("Error", "Error range of " + predicate.getShow() + " property is inconsistent", "error");
                        }
                    } else { //both "classic" and custom range
                        var rangeOptions: {value: string, description: string}[] = [];//prepare the range options...
                        console.log("range ", range);

                        //...with the custom range entries
                        for (var i = 0; i < customRanges.length; i++) {
                            var crEntries = customRanges[i].getEntries();
                            for (var j = 0; j < crEntries.length; j++) {
                                //for every entry check if it's not already added to rangeOptions (possible if a CRE is in multiple CR)
                                let alreadyIn: boolean = false;
                                for (var k = 0; k < rangeOptions.length; k++) {
                                    if (rangeOptions[k].value == crEntries[j].getName()) {
                                        alreadyIn = true;
                                        break;
                                    }
                                }
                                if (!alreadyIn) {
                                    rangeOptions.push({ value: crEntries[j].getName(), description: crEntries[j].getDescription() });
                                }
                            }
                        }

                        //...and the classic ranges
                        if (rngType == RDFTypesEnum.resource || rngType == RDFTypesEnum.plainLiteral || rngType == RDFTypesEnum.typedLiteral) {
                            rangeOptions.push({ value: rngType, description: rngType });
                        } else if (rngType == RDFTypesEnum.literal) {
                            rangeOptions.push({ value: RDFTypesEnum.plainLiteral, description: RDFTypesEnum.plainLiteral });
                            rangeOptions.push({ value: RDFTypesEnum.typedLiteral, description: RDFTypesEnum.typedLiteral });
                        } else if (rngType == RDFTypesEnum.undetermined) {
                            rangeOptions.push({ value: RDFTypesEnum.resource, description: RDFTypesEnum.resource });
                            rangeOptions.push({ value: RDFTypesEnum.plainLiteral, description: RDFTypesEnum.plainLiteral });
                            rangeOptions.push({ value: RDFTypesEnum.typedLiteral, description: RDFTypesEnum.typedLiteral });
                        }
                        //ask the user to choose
                        this.modalService.select("Select range type", null, rangeOptions, true).then(
                            (selectedRange: any) => {
                                //check if selected range is one of the customs
                                for (var i = 0; i < crEntries.length; i++) {
                                    if (selectedRange == crEntries[i].getName()) {
                                        this.enrichWithCustomRange(predicate, crEntries[i]);
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

    private enrichWithCustomRange(predicate: ARTURIResource, crEntry: CustomRangeEntry) {
        this.resViewModalService.enrichCustomForm("Add " + predicate.getShow(), crEntry.getId()).then(
            (entryMap: any) => {
                this.crService.runCoda(this.resource, predicate, crEntry.getId(), entryMap).subscribe(
                    (stResp: any) => {
                        this.update.emit(null);
                    }
                );
            },
            () => { }
        )
    }

    /**
     * Opens a newPlainLiteral modal to enrich the predicate with a plain literal value 
     */
    private enrichWithPlainLiteral(predicate: ARTURIResource) {
        this.modalService.newPlainLiteral("Add " + predicate.getShow()).then(
            (literal: any) => {
                this.propService.createAndAddPropValue(this.resource, predicate, literal.value, null, RDFTypesEnum.plainLiteral, literal.lang).subscribe(
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
            (literal: any) => {
                this.propService.createAndAddPropValue(this.resource, predicate, literal.value, literal.datatype, RDFTypesEnum.typedLiteral).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => { }
        );
    }

    /**
     * Opens a modal to enrich the predicate with a resource 
     */
    private enrichWithResource(predicate: ARTURIResource, resourceTypes?: ARTURIResource[]) {
        this.resViewModalService.enrichProperty("Add " + predicate.getShow(), predicate, resourceTypes).then(
            (resource: any) => {
                this.propService.addExistingPropValue(this.resource, predicate, resource.getNominalValue(), RDFTypesEnum.resource).subscribe(
                    stResp => this.update.emit(null)
                )
            },
            () => { }
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }
}