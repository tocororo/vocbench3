import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode } from "../../utils/ARTResources";
import { SKOSXL } from "../../utils/Vocabulary";
import { RDFTypesEnum } from "../../utils/ARTResources";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";

@Component({
    selector: "label-relations-renderer",
    templateUrl: "./objectListRenderer.html",
})
export class LaberRelationsPartitionRenderer {

    @Input('object-list') objectList: ARTResource[];
    @Input() resource: ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    private label = "Label relations";
    private addBtnImgTitle = "Add a relation";
    private removeBtnImgTitle = "Remove relation";

    constructor(private propertyService: PropertyServices, private resourceService: ResourceServices,
        private resViewModalService: ResViewModalServices, private browsingService: BrowsingServices) { }

    //add type
    private add() {
        this.resViewModalService.enrichProperty("Add " + SKOSXL.labelRelation.getShow(), SKOSXL.labelRelation, [SKOSXL.label]).then(
            resource => {
                this.propertyService.addExistingPropValue(
                    this.resource, SKOSXL.labelRelation, resource.getNominalValue(), RDFTypesEnum.resource).subscribe(
                    stResp => this.update.emit(null)
                    )
            },
            () => { }
        );
    }

    private remove(label: ARTURIResource) {
        this.resourceService.removePropertyValue(this.resource, SKOSXL.labelRelation, label).subscribe(
            stResp => this.update.emit(null)
        );
    }

    private objectDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);//clicked object (type) can be a URIResource or BNode
    }


}