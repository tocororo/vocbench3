import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents } from "../../models/Configuration";
import { PartitionFilterPreference } from "../../models/Properties";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

export class TemplateEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "template-editor-modal",
    templateUrl: "./templateEditorModal.html",
})
export class TemplateEditorModal implements ModalComponent<TemplateEditorModalData> {
    context: TemplateEditorModalData;

    private filter: PartitionFilterPreference;

    constructor(public dialog: DialogRef<TemplateEditorModalData>, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {}

    ok() {
        let config: { [key: string]: any } = {
            template: this.filter
        }
        this.sharedModals.storeConfiguration("Store template", ConfigurationComponents.TEMPLATE_STORE, config).then(
            () => {
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}