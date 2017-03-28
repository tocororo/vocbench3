import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../models/ARTResources";

import { PropertyServices } from "../../services/propertyServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ModalServices } from "../../widget/modal/modalServices";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";
import { SKOSXL } from "../../models/Vocabulary";
import { FormCollection, CustomForm } from "../../models/CustomForms";



@Component({
    selector: "pred-obj-list-renderer",
    templateUrl: "./predicateObjectsListRenderer.html",
})
export abstract class AbstractPredObjListRenderer {

    /**
     * INPUTS / OUTPUTS
     */

    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource: ARTResource; //resource described
    @Output() update = new EventEmitter(); //something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();


    protected propService: PropertyServices;
    protected resourcesService: ResourcesServices;
    protected cfService: CustomFormsServices;
    protected skosxlService: SkosxlServices;
    protected modalService: ModalServices;
    protected browsingService: BrowsingServices;
    protected rvModalService: ResViewModalServices;
    
    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices, skosxlService: SkosxlServices,
        modalService: ModalServices, browsingService: BrowsingServices, resViewModalService: ResViewModalServices) {
        this.propService = propService;
        this.cfService = cfService;
        this.skosxlService = skosxlService;
        this.modalService = modalService;
        this.rvModalService = resViewModalService;
        this.resourcesService = resourcesService;
        this.browsingService = browsingService;
    }

    /**
     * ATTRIBUTES
     */

    //to handle partition collapsed/expanded
    partitionCollapsed: boolean = false;

    /**
     * Root property described in the partition
     */
    abstract rootProperty: ARTURIResource;
    /**
     * Label of the partition (e.g. rdf:type for types partition, skos:inScheme for schemes partition, ...)
     */
    abstract label: string;
    /**
     * Src of the "add" icon placed on the groupPanel outline.
     * This is specific of a partition.
     */
    abstract addBtnImgSrc: string;
    /**
     * Title show on mouseover on the "add" icon placed on the groupPanel outline.
     * This is specific of a partition.
     */
    abstract addBtnImgTitle: string;
    /**
     * Title shown on mouseover on the "-" button placed near an object in a subPanel body when just one property of the partition is enriched
     */
    abstract removeBtnImgTitle: string;

    /**
     * METHODS
     */

    /**
     * Should allow to enrich a property by opening a modal and selecting a value.
     * It can get an optional parameter "property".
     * This is fired when the add button is clicked (the one placed on the groupPanel outline) without property parameter,
     * or hen the "+" button of a specific property panel is clicked (placed in the subPanel heading) with the property provided.
     * If property is provided (add fired from specific property panel) the modal won't allow to change it allowing so
     * to enrich just that property, otherwise, if property is not provided (add fired from the generic partition panel),
     * the modal allow to change property to enrich.
     * @param predicate property to enrich.
     */
    abstract add(predicate?: ARTURIResource): void;
    /**
     * Removes an object related to the given predicate.
     * This is fired when the "-" button is clicked (near an object).
     */
    abstract removePredicateObject(predicate: ARTURIResource, object: ARTNode): void;
    
    /**
     * When the object is edited or replaced requires update of res view
     */
    private onObjectUpdate() {
        this.update.emit();
    }
    /**
     * Fired when an object in a subPanel is double clicked. It should simply emit a objectDblClick event.
     */
    private objectDblClick(obj: ARTNode) {
        if (obj.isResource()) {//emit double click only for resources (not for ARTLiteral that cannot be described in a ResView)
            this.dblclickObj.emit(<ARTResource>obj);
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

    /**
     * Given a predicate, gets its range and based on the range (and the eventually custom range) allows to enrich it
     * @param predicate
     */
    enrichProperty(predicate: ARTURIResource) {
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
        this.rvModalService.enrichCustomForm("Add " + predicate.getShow(), form.getId()).then(
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
        this.rvModalService.enrichProperty("Add " + predicate.getShow(), predicate, resourceTypes).then(
            (resource: any) => {
                this.propService.addExistingPropValue(this.resource, predicate, resource.getNominalValue(), RDFTypesEnum.resource).subscribe(
                    stResp => this.update.emit(null)
                )
            },
            () => { }
        );
        // this.resViewModalService.addPropertyValue("Add " + predicate.getShow(), this.resource, predicate, false).then(
        //     (data: any) => {
        //         // data.property: this.selectedProperty, value: this.selectedResource }
        //         this.propService.addExistingPropValue(this.resource, predicate, data.value, RDFTypesEnum.resource).subscribe(
        //             stResp => { this.update.emit() }
        //         )
        //     },
        //     () => {}
        // );
    }

}