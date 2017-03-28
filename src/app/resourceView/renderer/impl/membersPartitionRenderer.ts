import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredObjListRenderer } from "../abstractPredObjListRenderer";
import { SkosServices } from "../../../services/skosServices";
import { VBEventHandler } from "../../../utils/VBEventHandler"
import { ARTResource, ARTURIResource, ARTNode, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { SKOS } from "../../../models/Vocabulary";

import { PropertyServices } from "../../../services/propertyServices";
import { SkosxlServices } from "../../../services/skosxlServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { ModalServices } from "../../../widget/modal/modalServices";
import { BrowsingServices } from "../../../widget/modal/browsingModal/browsingServices";

@Component({
    selector: "members-renderer",
    templateUrl: "../predicateObjectsListRenderer.html",
})
export class MembersPartitionRenderer extends AbstractPredObjListRenderer {

    //inherited from AbstractPredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty = SKOS.member;
    label = "Members";
    addBtnImgTitle = "Add member";
    addBtnImgSrc = require("../../../../assets/images/collection_create.png");
    removeBtnImgTitle = "Remove member";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices, skosxlService: SkosxlServices,
        modalService: ModalServices, browsingService: BrowsingServices, rvModalService: ResViewModalServices,
        private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, skosxlService, modalService, browsingService, rvModalService);
    }

    /**
     * Adds a member in a collection (unordered)
     */
    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a member", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;

                if (prop.getURI() == this.rootProperty.getURI()) { //it's using skos:member
                    this.skosService.addToCollection(this.resource, member).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's using a subProperty of skos:member
                    this.propService.addExistingPropValue(this.resource, prop, member.getNominalValue(), RDFTypesEnum.resource).subscribe(
                        stResp => {
                            if (member.getRole() == RDFResourceRolesEnum.skosCollection ||
                                member.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                                this.eventHandler.nestedCollectionAddedEvent.emit({ nested: member, container: this.resource });
                            }
                            this.update.emit(null);
                        }
                    );
                }
            },
            () => { }
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //removing skos:member relation
                this.skosService.removeFromCollection(this.resource, <ARTResource>object).subscribe(
                    stResp => this.update.emit(null)
                );
            } else {//predicate is some subProperty of rdf:type
                this.resourcesService.removeTriple(this.resource, predicate, object).subscribe(
                    stResp => {
                        alert("remove of " + predicate.getShow() + " value is not available");
                    }
                );
            }
        }
    }

}