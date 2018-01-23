import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { SkosServices } from "../../../services/skosServices";
import { VBEventHandler } from "../../../utils/VBEventHandler"
import { ARTResource, ARTURIResource, ARTNode, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { SKOS } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "members-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class MembersPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.members;
    rootProperty = SKOS.member;
    label = "Members";
    addBtnImgTitle = "Add member";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/collection_create.png");
    removeBtnImgTitle = "Remove member";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        rvModalService: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, rvModalService);
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
                    this.resourcesService.addValue(this.resource, prop, member).subscribe(
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
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit()
        )
    }

    removeAllValues(predicate: ARTURIResource) {
        let removeFnArray: any[] = [];
        for (var i = 0; i < this.predicateObjectList.length; i++) {
            let objList: ARTNode[] = this.predicateObjectList[i].getObjects();
            for (var j = 0; j < objList.length; j++) {
                removeFnArray.push(this.getRemoveFunction(predicate, objList[j]));
            }
        }
        this.removeAllRicursively(removeFnArray);
    }

    getRemoveFunction(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            return this.cfService.removeReifiedResource(this.resource, predicate, object);
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //removing skos:member relation
                return this.skosService.removeFromCollection(this.resource, <ARTResource>object);
            } else {//predicate is some subProperty of skos:member
                return this.resourcesService.removeValue(this.resource, predicate, object);
            }
        }
    }

}