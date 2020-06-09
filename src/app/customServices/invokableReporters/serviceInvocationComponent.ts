import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ServiceInvocationDefinition } from "../../models/InvokableReporter";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { InvokableReporterModalServices } from "./modals/invokableReporterModalServices";

@Component({
    selector: "service-invocation",
    templateUrl: "./serviceInvocationComponent.html",
    host: { class: "vbox" },
    styleUrls: ["../customServices.css"]
})
export class ServiceInvocationComponent {
    @Input() invocation: ServiceInvocationDefinition;
    @Input() idx: number;
    @Output() update: EventEmitter<void> = new EventEmitter(); //tells to the parent that the service has been modified

    objectKeys = Object.keys; //used in template for iterate over invocation.arguments

    private editInvocationAuthorized: boolean;

    constructor(private invokableReporterModals: InvokableReporterModalServices) {}

    ngOnInit() {
        this.editInvocationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterSectionUpdate);
    }
    
    private editInvocation() {
        this.invokableReporterModals.openServiceInvocationEditor("Edit Service invocation", this.invocation.reporterRef, { def: this.invocation, idx: this.idx }).then(
            () => {
                this.update.emit();
            },
            () => {}
        )
    }

}