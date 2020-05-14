import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SkosServices } from "../../../../services/skosServices";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "members-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class MembersPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.members;
    addBtnImgTitle = "Add member";
    addBtnImgSrc = require("../../../../../assets/images/icons/actions/skosCollection_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    /**
     * Adds a member in a collection (unordered)
     */
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, predicate, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: MultiActionFunction[] = [];

                if (prop.getURI() == this.rootProperty.getURI()) { //it's using skos:member
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push({
                            function: this.skosService.addToCollection(<ARTURIResource>this.resource, v),
                            value: v
                        });
                    });
                } else { //it's enriching a subProperty of skos:member
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push({
                            function: this.resourcesService.addValue(this.resource, prop, v).map(
                                stResp => {
                                    if (v.getRole() == RDFResourceRolesEnum.skosCollection || v.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                                        this.eventHandler.nestedCollectionAddedEvent.emit({ nested: v, container: this.resource });
                                    }
                                }
                            ),
                            value: v
                        });
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