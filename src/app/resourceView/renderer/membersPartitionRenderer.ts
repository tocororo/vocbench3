import {Component, Input, Output, EventEmitter} from "@angular/core";
import { AbstractPredicateObjectListRenderer } from "./abstractPredicateObjectListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import {SkosServices} from "../../services/skosServices";
import {ARTResource, ARTURIResource, ARTNode, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum} from "../../utils/ARTResources";
import { VBEventHandler } from "../../utils/VBEventHandler"
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {SKOS} from "../../utils/Vocabulary";
import {ResViewModalServices} from "../resViewModals/resViewModalServices";


@Component({
	selector: "members-renderer",
	templateUrl: "./predicateObjectListRenderer.html",
})
export class MembersPartitionRenderer extends AbstractPredicateObjectListRenderer {
    
    //inherited from AbstractPredicateObjectListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty = SKOS.member;
    label = "Members";
    addBtnImgTitle = "Add member";
    addBtnImgSrc = require("../../../assets/images/collection_create.png");
    removeBtnImgTitle = "Remove member";
    
    constructor(propService: PropertyServices, resourceService: ResourceServices, crService: CustomRangeServices,
        private skosService: SkosServices, private rvModalService: ResViewModalServices,
        private vbCtx: VocbenchCtx, private eventHandler: VBEventHandler) {
        super(propService, resourceService, crService);
    }
    
    /**
     * Adds a member in a collection (unordered)
     */
    add() {
        this.rvModalService.addPropertyValue("Add a member", this.resource, [this.rootProperty]).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;

                if (prop.getURI() == this.rootProperty.getURI()) { //it's using skos:member
                    this.skosService.addToCollection(this.resource, member, this.vbCtx.getContentLanguage(true)).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's using a subProperty of skos:member
                    this.propService.addExistingPropValue(this.resource, prop, member.getNominalValue(), RDFTypesEnum.resource).subscribe(
                        stResp => {
                            if (member.getRole() == RDFResourceRolesEnum.skosCollection ||
                                member.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                                this.eventHandler.nestedCollectionAddedEvent.emit({nested: member, container: this.resource});
                            }
                            this.update.emit(null);
                        }
                    );
                }
            },
            () => {}
        )
    }

    enrichProperty(predicate: ARTURIResource) {
        this.rvModalService.enrichProperty("Add a " + predicate.getShow(), predicate, [SKOS.collection, SKOS.concept]).then(
            (selectedMember: any) => {
                if (predicate.getURI() == this.rootProperty.getURI()) {
                    this.skosService.addToCollection(this.resource, selectedMember, this.vbCtx.getContentLanguage(true)).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //predicate is some subProperty of skos:member
                    this.propService.addExistingPropValue(this.resource, predicate, (<ARTResource>selectedMember).getNominalValue(), RDFTypesEnum.resource).subscribe(
                        stResp => {
                            if (selectedMember.getRole() == RDFResourceRolesEnum.skosCollection ||
                                selectedMember.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                                this.eventHandler.nestedCollectionAddedEvent.emit({nested: selectedMember, container: this.resource});
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
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //removing skos:member relation
                this.skosService.removeFromCollection(this.resource, <ARTResource>object, this.vbCtx.getContentLanguage(true)).subscribe(
                    stResp => this.update.emit(null)
                );
            } else {//predicate is some subProperty of rdf:type
                this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                    stResp => {
                        if ((<ARTResource>object).getRole() == RDFResourceRolesEnum.skosCollection ||
                                (<ARTResource>object).getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                                this.eventHandler.nestedCollectionAddedEvent.emit({nested: <ARTResource>object, container: this.resource});
                            }
                        this.update.emit(null);
                    }
                );
            }
        }
    }
    
}