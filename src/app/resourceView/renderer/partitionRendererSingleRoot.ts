import { Component, Input, Output, EventEmitter } from "@angular/core";
import { PartitionRenderer } from "./partitionRenderer";
import { ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../models/ARTResources";
import { PropertyServices } from "../../services/propertyServices";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";
import { FormCollection, CustomForm } from "../../models/CustomForms";



@Component({
    selector: "partition-renderer-single",
    templateUrl: "./partitionRenderer.html",
})
export abstract class PartitionRenderSingleRoot extends PartitionRenderer {

    protected propService: PropertyServices;
    protected resourcesService: ResourcesServices;
    protected cfService: CustomFormsServices;
    protected basicModals: BasicModalServices;
    protected browsingModals: BrowsingModalServices;
    protected creationModals: CreationModalServices;
    protected rvModalService: ResViewModalServices;
    
    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices, 
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModalService: ResViewModalServices) {
        super();
        this.propService = propService;
        this.cfService = cfService;
        this.basicModals = basicModals;
        this.creationModals = creationModal;
        this.rvModalService = resViewModalService;
        this.resourcesService = resourcesService;
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
                    if (ranges.type == RDFTypesEnum.resource) {
                        this.enrichWithResource(predicate, ranges.rangeCollection.resources);
                    } else if (ranges.type == RDFTypesEnum.plainLiteral) {
                        this.enrichWithPlainLiteral(predicate);
                    } else if (ranges.type == RDFTypesEnum.typedLiteral) {
                        //in case range type is typedLiteral, the rangeColl (if available) represents the admitted datatypes
                        this.enrichWithTypedLiteral(predicate, ranges.rangeCollection.resources, ranges.rangeCollection.dataRanges);
                    } else if (ranges.type == RDFTypesEnum.literal) {
                        var options = [RDFTypesEnum.typedLiteral, RDFTypesEnum.plainLiteral];
                        this.basicModals.select("Select range type", null, options).then(
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
                    if (ranges.type == RDFTypesEnum.resource || ranges.type == RDFTypesEnum.plainLiteral || ranges.type == RDFTypesEnum.typedLiteral) {
                        rangeOptions.push(new CustomForm(ranges.type, ranges.type, ranges.type));
                    } else if (ranges.type == RDFTypesEnum.literal) {
                        rangeOptions.push(new CustomForm(RDFTypesEnum.plainLiteral, RDFTypesEnum.plainLiteral, RDFTypesEnum.plainLiteral));
                        rangeOptions.push(new CustomForm(RDFTypesEnum.typedLiteral, RDFTypesEnum.typedLiteral, RDFTypesEnum.typedLiteral));
                    } else if (ranges.type == RDFTypesEnum.undetermined) { //undetermined => range could be resource and any kind of literal
                        rangeOptions.push(new CustomForm(RDFTypesEnum.resource, RDFTypesEnum.resource, RDFTypesEnum.resource));
                        rangeOptions.push(new CustomForm(RDFTypesEnum.plainLiteral, RDFTypesEnum.plainLiteral, RDFTypesEnum.plainLiteral));
                        rangeOptions.push(new CustomForm(RDFTypesEnum.typedLiteral, RDFTypesEnum.typedLiteral, RDFTypesEnum.typedLiteral));
                    }
                    //and custom ranges
                    var customForms = formCollection.getForms();
                    rangeOptions = rangeOptions.concat(customForms);

                    //ask the user to choose
                    this.basicModals.selectCustomForm("Select a range type", rangeOptions).then(
                        (selectedCF: any) => {
                            //check if selected range is one of the customs
                            for (var i = 0; i < customForms.length; i++) {
                                if ((<CustomForm>selectedCF).getId() == customForms[i].getId()) {
                                    this.enrichWithCustomForm(predicate, customForms[i]);
                                    return;
                                }
                            }
                            if ((<CustomForm>selectedCF).getId() == RDFTypesEnum.resource) {
                                this.enrichWithResource(predicate, ranges.rangeCollection.resources);
                            } else if ((<CustomForm>selectedCF).getId() == RDFTypesEnum.typedLiteral) {
                                this.enrichWithTypedLiteral(predicate);
                            } else if ((<CustomForm>selectedCF).getId() == RDFTypesEnum.plainLiteral) {
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
        this.rvModalService.enrichCustomForm("Add " + predicate.getShow(), form.getId()).then(
            (entryMap: any) => {
                this.cfService.addValueThroughCustomRange(this.resource, predicate, form.getId(), entryMap).subscribe(
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
        this.creationModals.newPlainLiteral("Add " + predicate.getShow()).then(
            (literal: any) => {
                this.resourcesService.addValue(this.resource, predicate, (<ARTLiteral>literal)).subscribe(
                    stResp => { this.update.emit(null) }
                );
            },
            () => { }
        );
    }

    /**
     * Opens a newTypedLiteral modal to enrich the predicate with a typed literal value 
     */
    private enrichWithTypedLiteral(predicate: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[]) {
        this.creationModals.newTypedLiteral("Add " + predicate.getShow(), allowedDatatypes, dataRanges).then(
            (literal: any) => {
                this.resourcesService.addValue(this.resource, predicate, <ARTLiteral>literal).subscribe(
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
        this.rvModalService.enrichProperty("Add " + predicate.getShow(), predicate, resourceTypes).then(
            (resource: any) => {
                this.resourcesService.addValue(this.resource, predicate, resource).subscribe(
                    stResp => this.update.emit(null)
                )
            },
            () => { }
        );
    }

}