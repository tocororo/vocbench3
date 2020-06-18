import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { CustomFormsServices } from "../../services/customFormsServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { PearlValidationResult } from "../../models/Coda";

export class PearlInferenceValidationModalData extends BSModalContext {
    constructor(public oldPearl: string,public newPearl: string) {
        super();
    }
}

@Component({
    selector: "pearl-inference-modal",
    templateUrl: "./pearlInferenceValidationModal.html",
})
export class PearlInferenceValidationModal implements ModalComponent<PearlInferenceValidationModalData> {
    context: PearlInferenceValidationModalData;

    private newPearl: string;
    
    constructor(public dialog: DialogRef<PearlInferenceValidationModalData>, private cfService: CustomFormsServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.newPearl = this.context.newPearl;
    }

    ok() {
        this.cfService.validatePearl(this.newPearl, "graph").subscribe(
            (result: PearlValidationResult) => {
                if (result.valid) {
                    this.dialog.close(this.newPearl);
                } else {
                    this.basicModals.alert("Invalid PEARL", result.details, "error");
                    return;
                }
            }
        );
        
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}