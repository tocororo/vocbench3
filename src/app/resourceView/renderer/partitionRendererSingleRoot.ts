import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, RDFTypesEnum } from "../../models/ARTResources";
import { CustomForm, CustomFormValue, FormCollection } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";
import { PropertyServices, RangeType } from "../../services/propertyServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { AddPropertyValueModalReturnData } from "../resViewModals/addPropertyValueModal";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { MultiAddFunction, PartitionRenderer } from "./partitionRenderer";

@Component({
    selector: "partition-renderer-single",
    templateUrl: "./partitionRenderer.html",
})
export abstract class PartitionRenderSingleRoot extends PartitionRenderer {

    protected propService: PropertyServices;
    protected browsingModals: BrowsingModalServices;
    protected creationModals: CreationModalServices;
    
    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices, 
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModalService: ResViewModalServices) {
        super(resourcesService, cfService, basicModals, resViewModalService);
        this.propService = propService;
        this.creationModals = creationModal;
        this.browsingModals = browsingModals;
    }

    /**
     * ATTRIBUTES
     */

    /**
     * Root property described in the partition
     */
    abstract rootProperty: ARTURIResource;

    /**
     * METHODS
     */

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return Observable.of(this.rootProperty);
    }

    /**
     * Given a predicate, gets its range and based on the range (and the eventually custom range) allows to enrich it
     * @param predicate
     */
    enrichProperty(predicate: ARTURIResource) {
        this.propService.getRange(predicate).subscribe(
            range => {
                var ranges = range.ranges;
                var formCollection: FormCollection = range.formCollection;
                if (ranges != undefined && formCollection == undefined) { //just "classic" range
                    //available values: resource, plainLiteral, typedLiteral, literal, undetermined, inconsistent
                    if (ranges.type == RangeType.resource) {
                        this.enrichWithResource(predicate);
                    } else if (ranges.type == RangeType.plainLiteral) {
                        this.enrichWithPlainLiteral(predicate);
                    } else if (ranges.type == RangeType.typedLiteral) {
                        //in case range type is typedLiteral, the rangeColl (if available) represents the admitted datatypes
                        let datatypes = ranges.rangeCollection ? ranges.rangeCollection.resources : null;
                        let dataRanges = ranges.rangeCollection ? ranges.rangeCollection.dataRanges : null;
                        this.enrichWithTypedLiteral(predicate, datatypes, dataRanges);
                    } else if (ranges.type == RangeType.literal) {
                        let datatypes = ranges.rangeCollection ? ranges.rangeCollection.resources : null;
                        if (datatypes != null) {
                            this.enrichWithTypedLiteral(predicate, datatypes, ranges.rangeCollection.dataRanges);
                        } else {
                            var options = [RDFTypesEnum.typedLiteral, RDFTypesEnum.plainLiteral];
                            this.basicModals.select("Select range type", null, options).then(
                                (selectedRange: any) => {
                                    if (selectedRange == RDFTypesEnum.typedLiteral) {
                                        let datatypes = ranges.rangeCollection ? ranges.rangeCollection.resources : null;
                                        this.enrichWithTypedLiteral(predicate, datatypes);
                                    } else if (selectedRange == RDFTypesEnum.plainLiteral) {
                                        this.enrichWithPlainLiteral(predicate);
                                    }
                                },
                                () => { }
                            );
                        }
                    } else if (ranges.type == RangeType.undetermined) {
                        var options = [RDFTypesEnum.resource, RDFTypesEnum.typedLiteral, RDFTypesEnum.plainLiteral];
                        this.basicModals.select("Select range type", null, options).then(
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
                        this.basicModals.alert("Error", "Error range of " + predicate.getShow() + " property is inconsistent", "error");
                    }
                } else if (ranges != undefined && formCollection != undefined) { //both "classic" and custom range
                    var rangeOptions: CustomForm[] = [];
                    //classic ranges (this is a workaround to use selection CF modal with classic range as well)
                    if (ranges.type == RangeType.resource || ranges.type == RangeType.plainLiteral || ranges.type == RangeType.typedLiteral) {
                        rangeOptions.push(new CustomForm(ranges.type, ranges.type, ranges.type));
                    } else if (ranges.type == RangeType.literal) {
                        rangeOptions.push(new CustomForm(RDFTypesEnum.plainLiteral, RDFTypesEnum.plainLiteral, RDFTypesEnum.plainLiteral));
                        rangeOptions.push(new CustomForm(RDFTypesEnum.typedLiteral, RDFTypesEnum.typedLiteral, RDFTypesEnum.typedLiteral));
                    } else if (ranges.type == RangeType.undetermined) { //undetermined => range could be resource and any kind of literal
                        rangeOptions.push(new CustomForm(RDFTypesEnum.resource, RDFTypesEnum.resource, RDFTypesEnum.resource));
                        rangeOptions.push(new CustomForm(RDFTypesEnum.plainLiteral, RDFTypesEnum.plainLiteral, RDFTypesEnum.plainLiteral));
                        rangeOptions.push(new CustomForm(RDFTypesEnum.typedLiteral, RDFTypesEnum.typedLiteral, RDFTypesEnum.typedLiteral));
                    }
                    //and custom ranges
                    var customForms = formCollection.getForms();
                    rangeOptions = rangeOptions.concat(customForms);

                    //ask the user to choose
                    this.basicModals.selectCustomForm("Select a range type", rangeOptions).then(
                        (selectedCF: CustomForm) => {
                            //check if selected range is one of the customs
                            for (var i = 0; i < customForms.length; i++) {
                                if ((<CustomForm>selectedCF).getId() == customForms[i].getId()) {
                                    this.enrichWithCustomForm(predicate, customForms[i]);
                                    return;
                                }
                            }
                            if (selectedCF.getId() == RDFTypesEnum.resource) {
                                this.enrichWithResource(predicate);
                            } else if (selectedCF.getId() == RDFTypesEnum.typedLiteral) {
                                this.enrichWithTypedLiteral(predicate);
                            } else if (selectedCF.getId() == RDFTypesEnum.plainLiteral) {
                                this.enrichWithPlainLiteral(predicate);
                            }
                        },
                        () => {}
                    );
                } else if (ranges == undefined && formCollection != undefined) {//just custom range
                    var forms = formCollection.getForms();
                    if (forms.length == 1) {//just one CREntry => prompt the CR form without asking to choose which CRE to use
                        this.enrichWithCustomForm(predicate, forms[0]);
                    } else if (forms.length > 1) { //multiple CREntry => ask which one to use
                        //prepare the range options with the custom range entries
                        this.basicModals.selectCustomForm("Select a Custom Range", forms).then(
                            (selectedCF: any) => {
                                this.enrichWithCustomForm(predicate, (<CustomForm>selectedCF));
                                return;
                            },
                            () => {}
                        )
                    } else { //no CR linked to the property has no Entries => error
                        this.basicModals.alert("Error", "The FormCollection " + formCollection.getId() + ", linked to property " +  predicate.getShow() + 
                            ", doesn't contain any CustomForm", "error");
                    }
                }
            }
        );
    }

    private enrichWithCustomForm(predicate: ARTURIResource, form: CustomForm) {
        this.resViewModals.enrichCustomForm("Add " + predicate.getShow(), form.getId()).then(
            (entryMap: any) => {
                let cfValue: CustomFormValue = new CustomFormValue(form.getId(), entryMap);
                this.addPartitionAware(this.resource, predicate, cfValue);
            },
            () => { }
        )
    }

    /**
     * Opens a newPlainLiteral modal to enrich the predicate with a plain literal value 
     */
    private enrichWithPlainLiteral(predicate: ARTURIResource) {
        this.creationModals.newPlainLiteral("Add " + predicate.getShow(), null, null, null, null, null, { enabled: true, allowSameLang: true }).then(
            (literal: ARTLiteral[]) => {
                let addFunctions: MultiAddFunction[] = [];
                literal.forEach((l: ARTLiteral) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(<ARTURIResource>this.resource, predicate, l),
                        value: l
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    /**
     * Opens a newTypedLiteral modal to enrich the predicate with a typed literal value 
     */
    private enrichWithTypedLiteral(predicate: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[]) {
        this.creationModals.newTypedLiteral("Add " + predicate.getShow(), predicate, allowedDatatypes, dataRanges, true).then(
            (literals: ARTLiteral[]) => {
                let addFunctions: MultiAddFunction[] = [];
                literals.forEach((l: ARTLiteral) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(<ARTURIResource>this.resource, predicate, l),
                        value: l
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    /**
     * Opens a modal to enrich the predicate with a resource 
     */
    private enrichWithResource(predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add " + predicate.getShow(), this.resource, predicate, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: MultiAddFunction[] = [];
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(<ARTURIResource>this.resource, prop, v),
                        value: v
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        )
    }

    /**
     * This represents the specific partition implementation for the add. It could be override in a partition if it has
     * a specific implementation (like in notes partition for which exists the addNote service that accept a SpecialValue as value)
     * @param resource
     * @param predicate 
     * @param value 
     */
    addPartitionAware(resource: ARTResource, predicate: ARTURIResource, value: ARTNode | CustomFormValue) {
        this.resourcesService.addValue(resource, predicate, value).subscribe(
            stResp => this.update.emit()
        );
    }

}