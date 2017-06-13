import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { PropertyServices } from '../../services/propertyServices';
import { ARTBNode, ARTLiteral, ResourceUtils } from '../../models/ARTResources';

export class DataRangeEditorModalData extends BSModalContext {
    constructor(public datarangeNode: ARTBNode) {
        super();
    }
}

@Component({
    selector: "data-range-editor-modal",
    templateUrl: "./dataRangeEditorModal.html",
})
export class DataRangeEditorModal implements ModalComponent<DataRangeEditorModalData> {
    context: DataRangeEditorModalData;

    private datarangePristine: ARTLiteral[] = [];
    private datarange: ARTLiteral[] = [];

    constructor(public dialog: DialogRef<DataRangeEditorModalData>, private propertyService: PropertyServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.propertyService.getDatarangeLiterals(this.context.datarangeNode).subscribe(
            datarange => {
                this.datarange = datarange;
                this.datarangePristine = datarange.slice(); //clone
            }
        )
    }

    onDatarangeChanged(datarange: ARTLiteral[]) {
        this.datarange = datarange;
    }

    ok(event: Event) {
        //check if the datarange list is changed
        var changed: boolean = false;
        for (var i = 0; i < this.datarange.length; i++) {
            let found: boolean = false;
            for (var j = 0; j < this.datarangePristine.length; j++) {
                let dtPristine: ARTLiteral = this.datarange[i];
                let dtUpdated: ARTLiteral = this.datarangePristine[j];
                if (dtPristine.getValue() == dtUpdated.getValue() && dtPristine.getDatatype() == dtUpdated.getDatatype()) {
                    found = true;
                    break; //value not changed (found also in the pristine) => go to the next
                }
            }
            if (!found) {
                changed = true;
            }
        }
        if (changed) {
            //invoke service to update the datarange
            this.propertyService.updateDataranges(this.context.datarangeNode, this.datarange).subscribe(
                stResp => {
                    event.stopPropagation();
                    event.preventDefault();
                    this.dialog.close();
                }
            )
        } else {
            this.cancel();
        }
        
    }

    cancel() {
        this.dialog.dismiss();
    }

}
