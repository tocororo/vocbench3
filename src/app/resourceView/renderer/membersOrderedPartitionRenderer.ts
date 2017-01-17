import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectListRenderer } from "./abstractPredicateObjectListRenderer";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { SkosServices } from "../../services/skosServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import {
    ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects,
    RDFResourceRolesEnum, RDFTypesEnum, ResAttribute
} from "../../utils/ARTResources";
import { VocbenchCtx } from "../../utils/VocbenchCtx";
import { SKOS } from "../../utils/Vocabulary";


@Component({
    selector: "members-ordered-renderer",
    templateUrl: "./membersOrderedPartitionRenderer.html",
})
export class MembersOrderedPartitionRenderer extends AbstractPredicateObjectListRenderer {

    //inherited from AbstractPredicateObjectListRenderer
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

    constructor(private crService: CustomRangeServices, private resourceService: ResourceServices, private skosService: SkosServices,
        private rvModalService: ResViewModalServices, private vbCtx: VocbenchCtx) {
        super();
    }

    private selectMember(member: ARTResource) {
        if (this.selectedMember == member) {
            this.selectedMember = null;
        } else {
            this.selectedMember = member;
        }
    }

    //needed to be implemented since this Component extends AbstractPredicateObjectListRenderer, but not used.
    //Use addFirst addLast addBefore and addAfter instead
    add() { }
    enrichProperty(predicate: ARTURIResource) { }

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
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
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

}