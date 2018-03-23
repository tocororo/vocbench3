import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../../models/ARTResources";
import { RDFS, SKOS, SKOSXL } from "../../../models/Vocabulary";
import { FormCollection, CustomForm } from "../../../models/CustomForms";
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices, RangeResponse } from "../../../services/propertyServices";
import { SkosServices } from "../../../services/skosServices";
import { SkosxlServices } from "../../../services/skosxlServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "properties-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class PropertiesPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.properties;
    rootProperty: ARTURIResource = null; //there is no root property for this partition
    label = "Other properties";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/prop_create.png");
    addBtnImgTitle = "Add a property value";
    removeBtnImgTitle = "Remove property value";

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
        ) {
            this.creationModals.newXLabel("Add " + predicate.getShow()).then(
                data => {
                    switch (predicate.getURI()) {
                        case SKOSXL.prefLabel.getURI(): {
                            this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, data.label, data.cls).subscribe(
                                stResp => this.update.emit(null),
                                (err: Error) => {
                                    if (err.name.endsWith('PrefAltLabelClashException')) {
                                        this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                            confirm => {
                                                this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, data.label, data.cls, false).subscribe(
                                                    stResp => this.update.emit(null)
                                                );
                                            },
                                            () => {}
                                        );
                                    }
                                }
                            );
                            break;
                        }
                        case SKOSXL.altLabel.getURI(): {
                            this.skosxlService.addAltLabel(<ARTURIResource>this.resource, data.label, data.cls).subscribe(
                                stResp => this.update.emit(null),
                            );
                            break;
                        }
                        case SKOSXL.hiddenLabel.getURI(): {
                            this.skosxlService.addHiddenLabel(<ARTURIResource>this.resource, data.label, data.cls).subscribe(
                                stResp => this.update.emit(null)
                            );
                            break;
                        }
                    }
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