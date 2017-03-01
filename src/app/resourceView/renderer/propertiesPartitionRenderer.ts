import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectsListRenderer } from "./abstractPredicateObjectsListRenderer";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../models/ARTResources";
import { SKOSXL } from "../../models/Vocabulary";
import { FormCollection, CustomForm } from "../../models/CustomForms";
import { ResourceUtils } from "../../utils/ResourceUtils";
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

    constructor(private propService: PropertyServices, private resourceService: ResourceServices, private cfService: CustomFormsServices,
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
                    var ranges = range.ranges;
                    var formCollection: FormCollection = range.formCollection;
                    if (ranges != undefined && formCollection == undefined) { //just "classic" range
                        //available values: resource, plainLiteral, typedLiteral, literal, undetermined, inconsistent
                        if (ranges.type == RDFTypesEnum.resource) {
                            this.enrichWithResource(predicate, ranges.rangeCollection);
                        } else if (ranges.type == RDFTypesEnum.plainLiteral) {
                            this.enrichWithPlainLiteral(predicate);
                        } else if (ranges.type == RDFTypesEnum.typedLiteral) {
                            var datatypes: string[] = [];
                            //in case range type is typedLiteral, the rangeColl (if available) represents the admitted datatypes
                            for (var i = 0; i < ranges.rangeCollection.length; i++) {
                                datatypes.push(ranges.rangeCollection[i].getNominalValue());
                            }
                            this.enrichWithTypedLiteral(predicate, datatypes);
                        } else if (ranges.type == RDFTypesEnum.literal) {
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
                        } else if (ranges.type == RDFTypesEnum.undetermined) {
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
                        } else if (ranges.type == "inconsistent") {
                            this.modalService.alert("Error", "Error range of " + predicate.getShow() + " property is inconsistent", "error");
                        }
                    } else if (ranges != undefined && formCollection != undefined) { //both "classic" and custom range
                        var rangeOptions: {value: string, description: string}[] = [];//prepare the range options...

                        //...with the custom range entries
                        var forms = formCollection.getForms();
                        for (var i = 0; i < forms.length; i++) {
                            rangeOptions.push({ value: forms[i].getName(), description: forms[i].getDescription() });
                        }

                        //...and the classic ranges
                        if (ranges.type == RDFTypesEnum.resource || ranges.type == RDFTypesEnum.plainLiteral || ranges.type == RDFTypesEnum.typedLiteral) {
                            rangeOptions.push({ value: ranges.type, description: ranges.type });
                        } else if (ranges.type == RDFTypesEnum.literal) {
                            rangeOptions.push({ value: RDFTypesEnum.plainLiteral, description: RDFTypesEnum.plainLiteral });
                            rangeOptions.push({ value: RDFTypesEnum.typedLiteral, description: RDFTypesEnum.typedLiteral });
                        } else if (ranges.type == RDFTypesEnum.undetermined) {
                            rangeOptions.push({ value: RDFTypesEnum.resource, description: RDFTypesEnum.resource });
                            rangeOptions.push({ value: RDFTypesEnum.plainLiteral, description: RDFTypesEnum.plainLiteral });
                            rangeOptions.push({ value: RDFTypesEnum.typedLiteral, description: RDFTypesEnum.typedLiteral });
                        }
                        //ask the user to choose
                        this.modalService.select("Select range type", null, rangeOptions, true).then(
                            (selectedRange: any) => {
                                //check if selected range is one of the customs
                                for (var i = 0; i < forms.length; i++) {
                                    if (selectedRange == forms[i].getName()) {
                                        this.enrichWithCustomForm(predicate, forms[i]);
                                        return;
                                    }
                                }
                                if (selectedRange == RDFTypesEnum.resource) {
                                    this.enrichWithResource(predicate, ranges.rangeCollection);
                                } else if (selectedRange == RDFTypesEnum.typedLiteral) {
                                    this.enrichWithTypedLiteral(predicate);
                                } else if (selectedRange == RDFTypesEnum.plainLiteral) {
                                    this.enrichWithPlainLiteral(predicate);
                                }
                            },
                            () => { }
                        )
                    } else if (ranges == undefined && formCollection != undefined) {//just custom range
                        var forms = formCollection.getForms();
                        if (forms.length == 1) {//just one CREntry => prompt the CR form without asking to choose which CRE to use
                            this.enrichWithCustomForm(predicate, forms[0]);
                        } else if (forms.length > 1) { //multiple CREntry => ask which one to use
                            //prepare the range options with the custom range entries
                            var rangeOptions: {value: string, description: string}[] = [];
                            for (var i = 0; i < forms.length; i++) {
                                rangeOptions.push({ value: forms[i].getName(), description: forms[i].getDescription() });
                            }
                            this.modalService.select("Select a Custom Form", null, rangeOptions, true).then(
                                (selectedRange: any) => {
                                    for (var i = 0; i < forms.length; i++) {
                                        if (selectedRange == forms[i].getName()) {
                                            this.enrichWithCustomForm(predicate, forms[i]);
                                            return;
                                        }
                                    }
                                }
                            );
                        } else { //no CR linked to the property has no Entries => error
                            this.modalService.alert("Error", "The FormCollection " + formCollection.getId() + ", linked to property " +  predicate.getShow() + 
                                ", doesn't contain any CustomForm", "error");
                        }
                    }
                }
            );
        }
    }

    private enrichWithCustomForm(predicate: ARTURIResource, form: CustomForm) {
        this.resViewModalService.enrichCustomForm("Add " + predicate.getShow(), form.getId()).then(
            (entryMap: any) => {
                this.cfService.executeForm(this.resource, predicate, form.getId(), entryMap).subscribe(
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
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }
}