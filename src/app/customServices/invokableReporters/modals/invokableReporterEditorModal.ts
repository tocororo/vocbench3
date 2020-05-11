import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents } from "../../../models/Configuration";
import { InvokableReporter, InvokableReporterDefinition, ServiceInvocationDefinition } from "../../../models/InvokableReporter";
import { ConfigurationsServices } from "../../../services/configurationsServices";

export class InvokableReporterEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public reporter?: InvokableReporter) {
        super();
    }
}

@Component({
    selector: "invokable-reporter-editor-modal",
    templateUrl: "./invokableReporterEditorModal.html",
})
export class InvokableReporterEditorModal implements ModalComponent<InvokableReporterEditorModalData> {
    context: InvokableReporterEditorModalData;

    private id: string;
    private label: string;
    private description: string;

    constructor(public dialog: DialogRef<InvokableReporterEditorModalData>, private configurationService: ConfigurationsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.reporter != null) { // edit mode
            this.id = this.context.reporter.id;
            this.label = this.context.reporter.getPropertyValue("label");
            this.description = this.context.reporter.getPropertyValue("description");
        }
    }

    private isDataValid(): boolean {
        //valid if both id and name are provided
        return this.id && this.id.trim() != "" && this.label && this.label.trim() != "";
    }

    ok() {
        if (!this.isDataValid()) {
            return;
        }

        if (this.context.reporter) { //edit
            //check if something changed
            let pristineLabel: string = this.context.reporter.getPropertyValue("label");
            let pristineDescription: string = this.context.reporter.getPropertyValue("description");
            if (pristineLabel != this.label || pristineDescription != this.description) {
                let invocations: ServiceInvocationDefinition[] = this.context.reporter.getPropertyValue("serviceInvocations");
                let updatedReporter: InvokableReporterDefinition = { label: this.label, description: this.description, serviceInvocations: invocations };
                this.configurationService.storeConfiguration(ConfigurationComponents.INVOKABLE_REPORER_STORE, "sys:" + this.context.reporter.id, updatedReporter).subscribe(
                    () => {
                        this.dialog.close();
                    }
                );
            } else { //nothing's changed => cancel, so the calling component doesn't update
                this.cancel();
            }
        } else { //create
            let newReporter: InvokableReporterDefinition = { label: this.label, description: this.description };
            this.configurationService.storeConfiguration(ConfigurationComponents.INVOKABLE_REPORER_STORE, "sys:" + this.id.trim(), newReporter).subscribe(
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