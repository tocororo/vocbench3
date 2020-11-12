import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ConfigurationComponents, Reference } from "../../../models/Configuration";
import { InvokableReporterDefinition } from "../../../models/InvokableReporter";
import { Scope, ScopeUtils, SettingsProp } from "../../../models/Plugins";
import { ConfigurationsServices } from "../../../services/configurationsServices";
import { InvokableReportersServices } from "../../../services/invokableReportersServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { InvokableReporterForm } from "../invokableReporterComponent";

@Component({
    selector: "invokable-reporter-editor-modal",
    templateUrl: "./invokableReporterEditorModal.html",
})
export class InvokableReporterEditorModal {
    @Input() title: string = 'Modal Title';
    @Input() existingReporters: Reference[];
    @Input() reporterRef: Reference;

    private id: string;
    private scopes: Scope[];
    private selectedScope: Scope;
    form: InvokableReporterForm;

    constructor(public activeModal: NgbActiveModal, private configurationServices: ConfigurationsServices,
        private invokableReporterService: InvokableReportersServices, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        if (this.reporterRef == null) { //create
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
            this.id = this.reporterRef.identifier;
            this.invokableReporterService.getInvokableReporter(this.reporterRef.relativeReference).subscribe(
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

    isDataValid(): boolean {
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
            sections: this.form.sections.value,
            mimeType: this.form.mimeType.value
        };

        if (this.reporterRef == null) { //create
            let reference = ScopeUtils.serializeScope(this.selectedScope) + ":" + this.id;
            //check if id is not duplicated
            if (this.existingReporters.some(r => r.relativeReference == reference)) {
                this.basicModals.alert("Already existing Reporter", "An Invokable Reporter with the same id already exists. Please change the ID and retry", ModalType.warning);
                return;
            }
            this.invokableReporterService.createInvokableReporter(reference, reporterDef).subscribe(
                () => {
                    this.activeModal.close();
                }
            )
        } else { //edit
            this.invokableReporterService.updateInvokableReporter(this.reporterRef.relativeReference, reporterDef).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        }
        
    }

    cancel() {
        this.activeModal.dismiss();
    }

}