import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredObjListRenderer } from "./abstractPredObjListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomFormsServices } from "../../services/customFormsServices";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";
import { ModalServices } from "../../widget/modal/modalServices";
import { VBEventHandler } from "../../utils/VBEventHandler"
import { ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../models/ARTResources";
import { SKOS } from "../../models/Vocabulary"

@Component({
    selector: "notes-renderer",
    templateUrl: "./predicateObjectsListRenderer.html",
})
export class NotesPartitionRenderer extends AbstractPredObjListRenderer {

    //inherited from AbstractPredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();

    rootProperty: ARTURIResource = SKOS.note;
    label = "Notes";
    addBtnImgTitle = "Add a note";
    addBtnImgSrc = require("../../../assets/images/propAnnotation_create.png");
    removeBtnImgTitle = "Remove note";

    constructor(propService: PropertyServices, resourceService: ResourceServices, cfService: CustomFormsServices, skosxlService: SkosxlServices,
        modalService: ModalServices, browsingService: BrowsingServices, rvModalService: ResViewModalServices) {
        super(propService, resourceService, cfService, skosxlService, modalService, browsingService, rvModalService);
    }

    add(predicate?: ARTURIResource) {
        if (predicate == null) {
            this.browsingService.browsePropertyTree("Select a property", [this.rootProperty]).then(
                (selectedProp: any) => {
                    this.add(selectedProp);
                },
                () => { }
            );
        } else {
            this.enrichProperty(predicate);
        }
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                stResp => {
                    this.update.emit(null);
                }
            );
        }
    }

}