import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTBNode, ARTNode, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { DatatypesServices } from "../../../services/datatypesServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "datatype-definition-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class DatatypeDefinitionPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.datatypeDefinitions;
    addBtnImgTitle = "Set facets";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/property_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private datatypeService: DatatypesServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add() {
        this.resViewModals.setDatatypeFacets("Set datatype facets", <ARTURIResource> this.resource).then(
            () => {
                this.update.emit();
            },
            () => {}
        )
    }

    editHandler(predicate: ARTURIResource, object: ARTNode) {
        //here I can force the cast to ARTBNode since I am sure that all the object handled in this partition are Bnode
        this.resViewModals.setDatatypeFacets("Edit datatype facets", <ARTURIResource>this.resource, <ARTBNode>object).then(
            () => {
                this.update.emit();
            },
            () => {}
        );
    }


    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                this.update.emit();
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.datatypeService.deleteDatatypeRestriction(<ARTURIResource> this.resource);
    }

}