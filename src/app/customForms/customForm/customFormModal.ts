import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { FormField, AnnotationName } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

export class CustomFormModalData extends BSModalContext {
    /**
     * @param title title of the dialog
     * @param creId custom range entry ID
     */
    constructor(
        public title: string,
        public cfId: string
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "custom-form-modal",
    templateUrl: "./customFormModal.html",
})
export class CustomFormModal implements ModalComponent<CustomFormModalData> {
    context: CustomFormModalData;

    private ontoType: string;
    
    private formFields: FormField[] = [];
    
    constructor(public dialog: DialogRef<CustomFormModalData>, public cfService: CustomFormsServices, public browsingModals: BrowsingModalServices,
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    /**
     * Valid if all the mandatory fields are not empty
     */
    private isInputValid(): boolean {
        var customFormValid: boolean = true;
        if (this.formFields != null) {
            for (var i = 0; i < this.formFields.length; i++) {
                let entry = this.formFields[i];
                let value = entry.value;

                let empty: boolean = false;
                if (typeof value == "string" && value.trim() == "") {
                    empty = true;
                } else if (Array.isArray(value) && value.length == 0) {
                    empty = true;
                }

                if (entry.isMandatory() && (value == null || empty)) {
                    customFormValid = false;
                }
            }
        }
        return customFormValid;
    }

    ok(event: Event) {

        //check in case of @Collection annotation, if min constraint is respected
        for (let f of this.formFields) {
            let listAnn = f.getAnnotation(AnnotationName.Collection);
            if (listAnn != null) {
                let min = listAnn.min;
                if (f.isMandatory()) { 
                    if (f.value.length < min) { //mandatory and minimun required vaules not provided
                        this.basicModals.alert("Incompleted form", "Field '" + f.getUserPrompt() + "' requires at least " + min + " values.", "warning");
                        return;
                    }
                } else {
                    if (f.value.length > 0 && f.value.length < min) { //not mandatory, but not enaugh values provided
                        this.basicModals.alert("Incompleted form", "Field '" + f.getUserPrompt() + "' is optional, anyway you filled it with only " 
                            + f.value.length + " value(s), while it requires at least " + min + " values. "
                            + "Please, provide more values or delete the provided ones", "warning");
                        return;
                    }
                }
            }
        };

        var entryMap: {[key: string]: any} = {}; //{key: value, key: value,...}
        for (var i = 0; i < this.formFields.length; i++) {
            var entry = this.formFields[i];

            let value: any = entry.value;
            let empty: boolean = false;
            try { if (value.trim() == "") { empty = true; } } catch (err) {} //entry value could be not a string, so the check is in a try-catch

            if (!empty) {
                //add the entry only if not already in
                var alreadyIn: boolean = false;
                for (var key in entryMap) {
                    if (key == entry.getUserPrompt()) {
                        alreadyIn = true;
                        break;
                    }
                }
                if (!alreadyIn) {
                    entryMap[entry.getUserPrompt()] = value;
                }
            }
        }
        event.stopPropagation();
        this.dialog.close(entryMap);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}