import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents, Reference } from "../../../models/Configuration";
import { InvokableReporterDefinition } from "../../../models/InvokableReporter";
import { Scope, ScopeUtils, SettingsProp } from "../../../models/Plugins";
import { ConfigurationsServices } from "../../../services/configurationsServices";
import { InvokableReportersServices } from "../../../services/invokableReportersServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { InvokableReporterForm } from "../invokableReporterComponent";

export class InvokableReporterEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public existingReporters: Reference[], public reporterRef?: Reference) {
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
    private scopes: Scope[];
    private selectedScope: Scope;
    private form: InvokableReporterForm;

    constructor(public dialog: DialogRef<InvokableReporterEditorModalData>, private configurationServices: ConfigurationsServices,
        private invokableReporterService: InvokableReportersServices, private basicModals: BasicModalServices) {
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
            );
            this.configurationServices.getConfigurationManager(ConfigurationComponents.INVOKABLE_REPORER_STORE).subscribe(
                cfgMgr => {
                    this.scopes = cfgMgr.configurationScopes;
                    this.selectedScope = cfgMgr.scope;
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
        if (this.id == null || this.id.trim() == "") {
            return false;
        }
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
            let reference = ScopeUtils.serializeScope(this.selectedScope) + ":" + this.id;
            //check if id is not duplicated
            if (this.context.existingReporters.some(r => r.relativeReference == reference)) {
                this.basicModals.alert("Already existing Reporter", "An Invokable Reporter with the same id already exists. Please change the ID and retry", "warning");
                return;
            }
            this.invokableReporterService.createInvokableReporter(reference, reporterDef).subscribe(
                () => {
                    this.dialog.close();
                }
            )
        } else { //edit
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