import { Component } from "@angular/core";
import { ModalType } from 'src/app/widget/modal/Modals';
import { Reference } from "../../models/Configuration";
import { InvokableReportersServices } from "../../services/invokableReportersServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { InvokableReporterModalServices } from "./modals/invokableReporterModalServices";

@Component({
    selector: "invokable-reporters-component",
    templateUrl: "./invokableReportersPageComponent.html",
    host: { class: "hbox" },
})
export class InvokableReportersPageComponent {

    reporters: Reference[];
    selectedReporter: Reference;

    createReporterAuthorized: boolean;
    deleteReporterAuthorized: boolean;

    constructor(private invokableReporterService: InvokableReportersServices, private invokableReporterModals: InvokableReporterModalServices,
        private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.createReporterAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterCreate);
        this.deleteReporterAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterDelete);

        this.initReporters();
    }

    private initReporters() {
        this.invokableReporterService.getInvokableReporterIdentifiers().subscribe(
            references => {
                this.reporters = references;
            }
        );
    }

    private selectReporter(reporter: Reference) {
        this.selectedReporter = reporter;
    }

    createReporter() {
        this.invokableReporterModals.openInvokableReporterEditor({ key: "INVOKABLE_REPORTERS.ACTIONS.CREATE_INVOKABLE_REPORT" }, this.reporters).then(
            () => {
                this.initReporters();
            },
            () => { }
        );
    }

    deleteReporter() {
        this.basicModals.confirm({ key: "INVOKABLE_REPORTERS.ACTIONS.DELETE_INVOKABLE_REPORT" }, { key: "MESSAGES.DELETE_INVOKABLE_REPORT_CONFIRM" }, ModalType.warning).then(
            () => {
                this.invokableReporterService.deleteInvokableReporter(this.selectedReporter.relativeReference).subscribe(
                    () => {
                        this.initReporters();
                    }
                );
            }
        );
    }

}