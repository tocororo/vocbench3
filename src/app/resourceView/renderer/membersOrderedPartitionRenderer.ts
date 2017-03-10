import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredObjListRenderer } from "./abstractPredObjListRenderer";
import { SkosServices } from "../../services/skosServices";
import {
    ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects,
    RDFResourceRolesEnum, RDFTypesEnum, ResAttribute
} from "../../models/ARTResources";
import { SKOS } from "../../models/Vocabulary";
import { VocbenchCtx } from "../../utils/VocbenchCtx";

import { PropertyServices } from "../../services/propertyServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourceServices } from "../../services/resourceServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ModalServices } from "../../widget/modal/modalServices";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";

@Component({
    selector: "members-ordered-renderer",
    templateUrl: "./membersOrderedPartitionRenderer.html",
})
export class MembersOrderedPartitionRenderer extends AbstractPredObjListRenderer {

    //inherited from AbstractPredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty = SKOS.memberList;
    membersProperty = SKOS.member;
    label = "Members";
    addBtnImgTitle = "Add member";
    addBtnImgSrc = require("../../../assets/images/collection_create.png");
    removeBtnImgTitle = "Remove member";

    private selectedMember: ARTResource;

    constructor(propService: PropertyServices, resourceService: ResourceServices, cfService: CustomFormsServices, skosxlService: SkosxlServices,
        modalService: ModalServices, browsingService: BrowsingServices, rvModalService: ResViewModalServices,
        private skosService: SkosServices, private vbCtx: VocbenchCtx) {
        super(propService, resourceService, cfService, skosxlService, modalService, browsingService, rvModalService);
    }

    private selectMember(member: ARTResource) {
        if (this.selectedMember == member) {
            this.selectedMember = null;
        } else {
            this.selectedMember = member;
        }
    }

    //needed to be implemented since this Component extends abstractPredObjListRenderer, but not used.
    //Use addFirst addLast addBefore and addAfter instead
    add() { }

    /**
     * Adds a first member to an ordered collection 
     */
    private addFirst(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a member", this.resource, this.membersProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;

                if (prop.getURI() == this.membersProperty.getURI()) { //it's using skos:member
                    this.skosService.addFirstToOrderedCollection(this.resource, member, this.vbCtx.getContentLanguage(true)).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's using a subProperty of skos:member
                    alert("Enrichment of " + prop.getShow() + " not available");
                }
            },
            () => { }
        );
    }

    /**
     * Adds a last member to an ordered collection 
     */
    private addLast(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a member", this.resource, this.membersProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;

                if (prop.getURI() == this.membersProperty.getURI()) { //it's using skos:member
                    this.skosService.addLastToOrderedCollection(this.resource, member, this.vbCtx.getContentLanguage(true)).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's using a subProperty of skos:member
                    alert("Enrichment of " + prop.getShow() + " not available");
                }
            },
            () => { }
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    private addBefore(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a member", this.resource, this.membersProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;
                var position = parseInt((<ARTLiteral>this.selectedMember.getAdditionalProperty(ResAttribute.INDEX)).getValue());
                if (prop.getURI() == this.membersProperty.getURI()) { //it's using skos:member
                    this.skosService.addInPositionToOrderedCollection(this.resource, member, position, this.vbCtx.getContentLanguage(true)).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's using a subProperty of skos:member
                    alert("Enrichment of " + prop.getShow() + " not available");
                }
            },
            () => { }
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    private addAfter(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a member", this.resource, this.membersProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;
                var position = parseInt((<ARTLiteral>this.selectedMember.getAdditionalProperty(ResAttribute.INDEX)).getValue()) + 1;
                if (prop.getURI() == this.membersProperty.getURI()) { //it's using skos:member
                    this.skosService.addInPositionToOrderedCollection(this.resource, member, position, this.vbCtx.getContentLanguage(true)).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's using a subProperty of skos:member
                    alert("Enrichment of " + prop.getShow() + " not available");
                }
            },
            () => { }
        );
    }

    // This is called only when the user remove the whole member list, not single member
    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //removing skos:member relation
                this.skosService.removeFromOrderedCollection(this.resource, <ARTResource>object, this.vbCtx.getContentLanguage(true)).subscribe(
                    stResp => this.update.emit(null)
                );
            } else {//predicate is some subProperty of skos:member
                this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                    stResp => {
                        alert("remove of " + predicate.getShow() + " value is not available");
                    }
                );
            }
        }
    }

    private removeMember(member: ARTResource) {
        this.skosService.removeFromOrderedCollection(this.resource, <ARTResource>member, this.vbCtx.getContentLanguage(true)).subscribe(
            stResp => this.update.emit(null)
        );
    }

    /**
     * Returns the title of the "-" button placed near an object in a subPanel body.
     */
    private getRemovePropImgTitle(predicate: ARTURIResource): string {
        return "Remove " + predicate.getShow();
    }

}