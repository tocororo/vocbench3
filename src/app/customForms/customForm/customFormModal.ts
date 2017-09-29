import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import {FormField} from "../../models/CustomForms";
import {RDFResourceRolesEnum} from "../../models/ARTResources";
import {VBContext} from "../../utils/VBContext";
import {BrowsingModalServices} from "../../widget/modal/browsingModal/browsingModalServices";
import {BasicModalServices} from "../../widget/modal/basicModal/basicModalServices";
import {CustomFormsServices} from "../../services/customFormsServices";

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

    private isInputValid(): boolean {
        var customFormValid: boolean = true;
        if (this.formFields != null) {
            for (var i = 0; i < this.formFields.length; i++) {
                var entry = this.formFields[i];
                var emptyString :boolean = false;
                try { if (entry['value'].trim() == "") { emptyString = true; } } catch (err) {} //entry value could be not a string, so the check is in a try-catch
                if (entry['checked'] && (entry['value'] == null || emptyString)) {
                    customFormValid = false;
                }
            }
        }
        return customFormValid;
    }

    ok(event: Event) {
        var entryMap: any = {}; //{key: svalue, key: value,...}
        for (var i = 0; i < this.formFields.length; i++) {
            var entry = this.formFields[i];
            if (entry['checked']) {
                //add the entry only if not already in
                var alreadyIn: boolean = false;
                for (var key in entryMap) {
                    if (key == entry.getUserPrompt()) {
                        alreadyIn = true;
                        break;
                    }
                }
                if (!alreadyIn) {
                    entryMap[entry.getUserPrompt()] = entry['value'];
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