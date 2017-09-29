import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { AlignmentServices } from "../../../services/alignmentServices";
import { ARTURIResource } from "../../../models/ARTResources";

export class MappingPropertySelectionModalData extends BSModalContext {
    constructor(public title: string, public message: string, public resource: ARTURIResource) {
        super();
    }
}

@Component({
    selector: "mapping-prop-select-modal",
    templateUrl: "./mappingPropertySelectionModal.html",
})
export class MappingPropertySelectionModal implements ModalComponent<MappingPropertySelectionModalData> {
    context: MappingPropertySelectionModalData;

    private mappingPropList: ARTURIResource[];
    private selectedProperty: ARTURIResource;
    private setAsDefault: boolean = true;

    constructor(public dialog: DialogRef<MappingPropertySelectionModalData>, private alignmentService: AlignmentServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //get from server list of mapping properties
        this.alignmentService.getMappingProperties(this.context.resource, false).subscribe(
            props => {
                this.mappingPropList = props;
            }
        );
    }

    ok(event: Event) {
        event.stopPropagation();
        var returnData: { property: ARTURIResource, setAsDefault: boolean } = { 
            property: this.selectedProperty, setAsDefault: this.setAsDefault 
        };
        this.dialog.close(returnData);
    }

    cancel() {
        this.dialog.dismiss();
    }
}