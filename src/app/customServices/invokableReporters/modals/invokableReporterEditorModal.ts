import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Configuration, ConfigurationComponents, Reference } from "../../../models/Configuration";
import { InvokableReporterDefinition } from "../../../models/InvokableReporter";
import { Scope, Settings, SettingsProp } from "../../../models/Plugins";
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

    // private id: string;
    // private scopes: Scope[];
    // private selectedScope: Scope;

    private form: InvokableReporterForm;

    constructor(public dialog: DialogRef<InvokableReporterEditorModalData>, private invokableReporterService: InvokableReportersServices,
        private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.reporterRef == null) { //create
            // this.invokableReporterService.getConfigurationScopes().subscribe(
            //     scopes => {
            //         this.scopes = scopes;
            //     }
            // )
            //this should be retrieved from service
            let config: Configuration = Settings.parse(JSON.parse("{\"@type\": \"it.uniroma2.art.semanticturkey.config.invokablereporter.InvokableReporter\",\"shortName\": \"Custom Service\",\"editRequired\": true,\"properties\": [{\"name\": \"label\",\"description\": \"The label of this invokable reporter\",\"displayName\": \"Label\",\"required\": true,\"type\": {\"name\": \"java.lang.String\"}}, {\"name\": \"description\",\"description\": \"A description of this invokable reporter\",\"displayName\": \"Description\",\"required\": false,\"type\": {\"name\": \"java.lang.String\"}}, {\"name\": \"sections\",\"description\": \"The invocations of custom services that make up this invokable reporter\",\"displayName\": \"Service invocations\",\"required\": false,\"type\": {\"name\": \"List\",\"typeArguments\": [{\"name\": \"it.uniroma2.art.semanticturkey.config.invokablereporter.ServiceInvocation\"}]}}, {\"name\": \"template\",\"description\": \"A template for rendering the report that takes all results as input. The template must conform to Mustache templating language.\",\"displayName\": \"Template\",\"required\": true,\"type\": {\"name\": \"java.lang.String\"}}, {\"name\": \"mimeType\",\"description\": \"The mimetype of the generated rendering\",\"displayName\": \"mime\",\"required\": true,\"type\": {\"name\": \"java.lang.String\"}}]}"));
            this.form = {
                label: config.getProperty("label"),
                description: config.getProperty("description"),
                sections: config.getProperty("sections"),
                template: config.getProperty("template"),
                mimeType: config.getProperty("mimeType")
            };
            this.form.mimeType.value = "text/html";
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