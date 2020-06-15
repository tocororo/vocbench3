import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents, Reference } from "../../../models/Configuration";
import { InvokableReporterDefinition } from "../../../models/InvokableReporter";
import { SettingsProp } from "../../../models/Plugins";
import { InvokableReportersServices } from "../../../services/invokableReportersServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { InvokableReporterForm } from "../invokableReporterComponent";

export class InvokableReporterEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public reporterRef?: Reference) {
        super();
    }
}

@Component({
    selector: "invokable-reporter-editor-modal",
    templateUrl: "./invokableReporterEditorModal.html",
})
export class InvokableReporterEditorModal implements ModalComponent<InvokableReporterEditorModalData> {
    context: InvokableReporterEditorModalData;

    private form: InvokableReporterForm;

    constructor(public dialog: DialogRef<InvokableReporterEditorModalData>, private invokableReporterService: InvokableReportersServices,
        private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.reporterRef == null) { //create
            this.invokableReporterService.getInvokableReporterForm().subscribe(
                reporter => {
                    this.form = {
                        label: reporter.getProperty("label"),
                        description: reporter.getProperty("description"),
                        sections: reporter.getProperty("sections"),
                        template: reporter.getProperty("template"),
                        mimeType: reporter.getProperty("mimeType")
                    };
                    this.form.mimeType.value = "text/html";
                }
            )
        } else { //edit
            this.invokableReporterService.getInvokableReporter(this.context.reporterRef.relativeReference).subscribe(
                reporter => {
                    this.form = {
                        label: reporter.getProperty("label"),
                        description: reporter.getProperty("description"),
                        sections: reporter.getProperty("sections"),
                        template: reporter.getProperty("template"),
                        mimeType: reporter.getProperty("mimeType")
                    };
                }
            )
        }
    }

    private isDataValid(): boolean {
        for (let field in this.form) {
            let f: SettingsProp = this.form[field];
            if (f.requireConfiguration()) {
                return false;
            }
        }
        return true;
    }

    ok() {
        if (!this.isDataValid()) {
            return;
        }

        let reporterDef: InvokableReporterDefinition = {
            label: this.form.label.value,
            description: this.form.description.value,
            template: this.form.template.value,
            mimeType: this.form.mimeType.value
        };

        if (this.context.reporterRef == null) { //create
            this.sharedModals.storeConfiguration("Store Invokable Reporter", ConfigurationComponents.INVOKABLE_REPORER_STORE, reporterDef).then(
                () => {
                    this.dialog.close()
                },
                () => {}
            );
        } else { //edit
            let newReporter: InvokableReporterDefinition = {
                label: this.form.label.value,
                description: this.form.description.value,
                template: this.form.template.value,
                mimeType: this.form.mimeType.value
            };
            this.invokableReporterService.updateInvokableReporter(this.context.reporterRef.relativeReference, reporterDef).subscribe(
                () => {
                    this.dialog.close();
                }
            );
        }
        
    }

    cancel() {
        this.dialog.dismiss();
    }

}