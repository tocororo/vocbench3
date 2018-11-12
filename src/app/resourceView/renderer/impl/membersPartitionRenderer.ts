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

    partition = ResViewPartition.members;
    rootProperty = SKOS.member;
    label = "Members";
    addBtnImgTitle = "Add member";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/collection_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    /**
     * Adds a member in a collection (unordered)
     */
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, predicate, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: Observable<any>[] = [];

                if (prop.getURI() == this.rootProperty.getURI()) { //it's using skos:member
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push(this.skosService.addToCollection(<ARTURIResource>this.resource, v));
                    });
                } else { //it's enriching a subProperty of skos:member
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push(
                            this.resourcesService.addValue(this.resource, prop, v).map(
                                stResp => {
                                    if (v.getRole() == RDFResourceRolesEnum.skosCollection || v.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                                        this.eventHandler.nestedCollectionAddedEvent.emit({ nested: v, container: this.resource });
                                    }
                                }
                            )
                        );
                    });
                }
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
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

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) { //removing skos:member relation
            return this.skosService.removeFromCollection(this.resource, <ARTResource>object);
        } else {//predicate is some subProperty of skos:member
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}