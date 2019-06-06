import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTURIResource } from "../../../models/ARTResources";
import { Language } from "../../../models/LanguagesCountries";
import { ResViewPartition } from "../../../models/ResourceView";
import { RDFS, SKOS, SKOSXL } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices, RangeResponse } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SkosServices } from "../../../services/skosServices";
import { SkosxlServices } from "../../../services/skosxlServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { NewXLabelModalReturnData } from "../../../widget/modal/creationModal/newResourceModal/skos/newXLabelModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { LexicalizationEnrichmentHelper } from "../lexicalizationEnrichmentHelper";
import { MultiAddError, MultiAddFunction } from "../multipleAddHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "properties-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class PropertiesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.properties;
    addBtnImgSrc = require("../../../../assets/images/icons/actions/property_create.png");
    addBtnImgTitle = "Add a property value";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices, 
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private lexicalizationEnrichmentHelper: LexicalizationEnrichmentHelper) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
        this.partitionCollapsed = (this.predicateObjectList.length > 5);
    }

    add(predicate: ARTURIResource) {
        //particular cases: labels
        if (predicate.getURI() == SKOSXL.prefLabel.getURI() ||
            predicate.getURI() == SKOSXL.altLabel.getURI() ||
            predicate.getURI() == SKOSXL.hiddenLabel.getURI()
        ) { //SKOSXL
            let prefLabelPred: boolean = predicate.getURI() == SKOSXL.prefLabel.getURI();
            this.creationModals.newXLabel("Add " + predicate.getShow(), null, null, null, null, null, { enabled: true, allowSameLang: !prefLabelPred }).then(
                (data: NewXLabelModalReturnData) => {
                    let addFunctions: MultiAddFunction[] = [];
                    let errorHandler: (errors: MultiAddError[]) => void;

                    data.labels.forEach((label: ARTLiteral) => {
                        addFunctions.push({ 
                            function: this.lexicalizationEnrichmentHelper.getAddLabelFn(<ARTURIResource>this.resource, predicate, label, data.cls),
                            value: label 
                        });
                    });
                    errorHandler = (errors: MultiAddError[]) => {
                        if (errors.length == 1) { //if only one error, try to handle it
                            let err: Error = errors[0].error;
                            if (err.name.endsWith('PrefAltLabelClashException') || err.name.endsWith('BlacklistForbiddendException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        this.lexicalizationEnrichmentHelper.getAddLabelFn(
                                            <ARTURIResource>this.resource, predicate, <ARTLiteral>errors[0].value, data.cls, 
                                            !err.name.endsWith('PrefAltLabelClashException'), err.name.endsWith('BlacklistForbiddendException')
                                        ).subscribe(
                                            stResp => this.update.emit(null)
                                        );
                                    },
                                    () => {}
                                );
                            } else {
                                this.handleSingleMultiAddError(errors[0]);
                            }
                        } else {
                            this.handleMultipleMultiAddError(errors);
                        }
                    }
                    this.addMultiple(addFunctions, errorHandler);
                },
                () => {}
            );
        } else if (
            predicate.getURI() == SKOS.prefLabel.getURI() ||
            predicate.getURI() == SKOS.altLabel.getURI() ||
            predicate.getURI() == SKOS.hiddenLabel.getURI()
        ) {
            let prefLabelPred: boolean = predicate.getURI() == SKOS.prefLabel.getURI();
            this.creationModals.newPlainLiteral("Add " + predicate.getShow(), null, null, null, null, null, { enabled: true, allowSameLang: !prefLabelPred }).then(
                (labels: ARTLiteral[]) => {
                    let addFunctions: MultiAddFunction[] = [];
                    let errorHandler: (errors: MultiAddError[]) => void;
                    labels.forEach((label: ARTLiteral) => {
                        addFunctions.push({ 
                            function: this.lexicalizationEnrichmentHelper.getAddLabelFn(<ARTURIResource>this.resource, predicate, label),
                            value: label 
                        });
                    });
                    errorHandler = (errors: MultiAddError[]) => {
                        if (errors.length == 1) { //if only one error, try to handle it
                            let err: Error = errors[0].error;
                            if (err.name.endsWith('PrefAltLabelClashException') || err.name.endsWith('BlacklistForbiddendException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        this.lexicalizationEnrichmentHelper.getAddLabelFn(
                                            <ARTURIResource>this.resource, predicate, <ARTLiteral>errors[0].value, null, 
                                            !err.name.endsWith('PrefAltLabelClashException'), err.name.endsWith('BlacklistForbiddendException')
                                        ).subscribe(
                                            stResp => this.update.emit(null)
                                        );
                                    },
                                    () => {}
                                );
                            } else {
                                this.handleSingleMultiAddError(errors[0]);
                            }
                        } else {
                            this.handleMultipleMultiAddError(errors);
                        }
                    }
                    this.addMultiple(addFunctions, errorHandler);
                },
                () => { }
            );
        } else if (predicate.getURI() == RDFS.label.getURI()) {
            this.creationModals.newPlainLiteral("Add " + predicate.getShow(), null, null, null, null, null, { enabled: true, allowSameLang: true }).then(
                (labels: ARTLiteral[]) => {
                    let addFunctions: MultiAddFunction[] = [];
                    let errorHandler: (errors: MultiAddError[]) => void;
                    labels.forEach((label: ARTLiteral) => {
                        addFunctions.push({ 
                            function: this.resourcesService.addValue(this.resource, predicate, label),
                            value: label 
                        });
                    });
                    this.addMultiple(addFunctions, errorHandler);
                }
            );
        } else {
            this.enrichProperty(predicate);
        }
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return Observable.fromPromise(
            this.browsingModals.browsePropertyTree("Select a property", null, <ARTURIResource>this.resource).then(
                selectedProp => {
                    return selectedProp
                },
                () => { }
            )
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return this.propService.getRange(predicate).flatMap(
            range => {
                return Observable.of(RangeResponse.isRangeCompliant(range, value));
            }
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit(null)
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }

    private copyLocaleHandler(predicate: ARTURIResource, eventData: { value: ARTNode, locales: Language[] }) {
        let addFunctions: MultiAddFunction[] = [];
        //this function is the handler of an event invoked in properties only when the value is a plain literal, so the cast is safe
        let value: ARTLiteral = <ARTLiteral>eventData.value;
        eventData.locales.forEach(l => {
            let newValue: ARTLiteral = new ARTLiteral(value.getValue(), null, l.tag);
            addFunctions.push({ 
                function: this.resourcesService.addValue(<ARTURIResource>this.resource, predicate, newValue), 
                value: newValue 
            });
        })
        this.addMultiple(addFunctions);
    }

}