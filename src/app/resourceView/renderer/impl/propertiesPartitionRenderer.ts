import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTURIResource } from "../../../models/ARTResources";
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
import { MultiAddError, MultiAddFunction } from "../partitionRenderer";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "properties-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class PropertiesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.properties;
    rootProperty: ARTURIResource = null; //there is no root property for this partition
    label = "Other properties";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/prop_create.png");
    addBtnImgTitle = "Add a property value";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices, 
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices, private skosxlService: SkosxlServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        this.partitionCollapsed = (this.predicateObjectList.length > 5);
    }

    add(predicate: ARTURIResource) {
        //particular cases: labels
        if (predicate.getURI() == SKOSXL.prefLabel.getURI() ||
            predicate.getURI() == SKOSXL.altLabel.getURI() ||
            predicate.getURI() == SKOSXL.hiddenLabel.getURI()
        ) { //SKOSXL
            let prefLabelPred: boolean = predicate.getURI() == SKOSXL.prefLabel.getURI();
            this.creationModals.newXLabel("Add " + predicate.getShow(), null, null, null, null, null, { enabled: true, prefLabel: !prefLabelPred }).then(
                (data: NewXLabelModalReturnData) => {
                    let addFunctions: MultiAddFunction[] = [];
                    let errorHandler: (errors: MultiAddError[]) => void;

                    if (predicate.getURI() == SKOSXL.prefLabel.getURI()) {
                        data.labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, label, data.cls), 
                                value: label 
                            });
                        });
                        errorHandler = (errors: MultiAddError[]) => {
                            if (errors.length == 1) { //if 
                                let err: Error = errors[0].error;
                                if (err.name.endsWith('PrefAltLabelClashException')) {
                                    this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                        confirm => {
                                            this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, <ARTLiteral>errors[0].value, data.cls, false).subscribe(
                                                stResp => this.update.emit(null)
                                            );
                                        },
                                        () => {}
                                    );
                                }
                            } else {
                                let message = "The addition of the following values have failed:"
                                errors.forEach((e: MultiAddError) => {
                                    message += "\n\n" + e.value.toNT() + "\nReason:\n" + e.error.name + ((e.error.message != null) ? ":\n" + e.error.message : "");
                                });
                                this.basicModals.alert("Error", message, "error");
                            }
                        }
                    } else if (predicate.getURI() == SKOSXL.altLabel.getURI()) {
                        data.labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosxlService.addAltLabel(<ARTURIResource>this.resource, label, data.cls), 
                                value: label 
                            });
                        });
                    } else if (predicate.getURI() == SKOSXL.hiddenLabel.getURI()) {
                        data.labels.forEach((label: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.skosxlService.addHiddenLabel(<ARTURIResource>this.resource, label, data.cls), 
                                value: label 
                            });
                        });
                    }
                    this.addMultiple(addFunctions, errorHandler);
                },
                () => {}
            );
        } else if (
            predicate.getURI() == SKOS.prefLabel.getURI() ||
            predicate.getURI() == SKOS.altLabel.getURI() ||
            predicate.getURI() == SKOS.hiddenLabel.getURI() ||
            predicate.getURI() == RDFS.label.getURI()
        ) {
            this.creationModals.newPlainLiteral("Add " + predicate.getShow()).then(
                (literal: any) => {
                    switch (predicate.getURI()) {
                        case SKOS.prefLabel.getURI():
                            this.skosService.setPrefLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal)).subscribe(
                                stResp => this.update.emit(null),
                                (err: Error) => {
                                    if (err.name.endsWith('PrefAltLabelClashException')) {
                                        this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                            confirm => {
                                                this.skosService.setPrefLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal), false).subscribe(
                                                    stResp => this.update.emit(null)
                                                );
                                            },
                                            () => {}
                                        );
                                    }
                                }
                            );
                            break;
                        case SKOS.altLabel.getURI():
                            this.skosService.addAltLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal)).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                        case SKOS.hiddenLabel.getURI():
                            this.skosService.addHiddenLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal)).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                        case RDFS.label.getURI():
                            this.resourcesService.addValue(<ARTURIResource>this.resource, predicate,  (<ARTLiteral>literal)).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                    }
                },
                () => { }
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

}