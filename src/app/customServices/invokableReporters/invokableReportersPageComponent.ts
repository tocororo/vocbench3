import { Component } from "@angular/core";
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

    private reporters: Reference[];
    private selectedReporter: Reference;

    private createReporterAuthorized: boolean;
    private deleteReporterAuthorized: boolean;

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

    private createReporter() {
        this.invokableReporterModals.openInvokableReporterEditor("New Invokable Reporter", this.reporters).then(
            () => {
                this.initReporters();
            },
            () => {}
        )
    }

    private deleteReporter() {
        this.basicModals.confirm("Delete Invokable Reporter", "You are deleting the Invokable Reporter '" + this.selectedReporter.identifier + "'. Are you sure?", "warning").then(
            () => {
                this.invokableReporterService.deleteInvokableReporter(this.selectedReporter.relativeReference).subscribe(
                    () => {
                        this.initReporters();
                    }
                )
            }
        )
    }

}