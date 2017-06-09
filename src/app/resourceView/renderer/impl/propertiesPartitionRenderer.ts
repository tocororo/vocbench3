import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredObjListRenderer } from "../abstractPredObjListRenderer";
import { ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../../models/ARTResources";
import { RDFS, SKOS, SKOSXL } from "../../../models/Vocabulary";
import { FormCollection, CustomForm } from "../../../models/CustomForms";

import { PropertyServices } from "../../../services/propertyServices";
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
    templateUrl: "../predicateObjectsListRenderer.html",
})
export class PropertiesPartitionRenderer extends AbstractPredObjListRenderer {

    //inherited from AbstractPredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = null; //there is no root property for this partition
    label = "Properties";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/prop_create.png");
    addBtnImgTitle = "Add a property value";
    removeBtnImgTitle = "Remove property value";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices, 
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        rvModalService: ResViewModalServices, private skosService: SkosServices, private skosxlService: SkosxlServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, rvModalService);
    }

    ngOnInit() {
        this.partitionCollapsed = (this.predicateObjectList.length > 4);
    }

    add(predicate?: ARTURIResource) {
        if (predicate == null) {
            this.browsingModals.browsePropertyTree("Select a property", null, <ARTURIResource>this.resource).then(
                (selectedProp: any) => {
                    this.add(selectedProp);
                },
                () => { }
            );
        } else {
            //particular cases: labels
            if (predicate.getURI() == SKOSXL.prefLabel.getURI() ||
                predicate.getURI() == SKOSXL.altLabel.getURI() ||
                predicate.getURI() == SKOSXL.hiddenLabel.getURI() ||
                predicate.getURI() == SKOS.prefLabel.getURI() ||
                predicate.getURI() == SKOS.altLabel.getURI() ||
                predicate.getURI() == SKOS.hiddenLabel.getURI() ||
                predicate.getURI() == RDFS.label.getURI()) {
                this.creationModals.newPlainLiteral("Add " + predicate.getShow()).then(
                    (literal: any) => {
                        switch (predicate.getURI()) {
                            case SKOSXL.prefLabel.getURI():
                                this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal), RDFTypesEnum.uri).subscribe(
                                    stResp => this.update.emit(null)
                                );
                                break;
                            case SKOSXL.altLabel.getURI():
                                this.skosxlService.addAltLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal), RDFTypesEnum.uri).subscribe(
                                    stResp => this.update.emit(null)
                                );
                                break;
                            case SKOSXL.hiddenLabel.getURI():
                                this.skosxlService.addHiddenLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal), RDFTypesEnum.uri).subscribe(
                                    stResp => this.update.emit(null)
                                );
                                break;
                            case SKOS.prefLabel.getURI():
                                this.skosService.addHiddenLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal)).subscribe(
                                    stResp => this.update.emit(null)
                                );
                                break;
                            case SKOS.altLabel.getURI():
                                this.skosService.addHiddenLabel(<ARTURIResource>this.resource, (<ARTLiteral>literal)).subscribe(
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
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            this.resourcesService.removeValue(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }
}