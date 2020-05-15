import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { ServiceInvocationDefinition } from "../../models/InvokableReporter";
import { InvokableReporterModalServices } from "./modals/invokableReporterModalServices";

@Component({
    selector: "service-invocation",
    templateUrl: "./serviceInvocationComponent.html",
    host: { class: "vbox" },
    styleUrls: ["../customServices.css"]
})
export class ServiceInvocationComponent {
    @Input() invocation: ServiceInvocationDefinition;
    @Output() update: EventEmitter<void> = new EventEmitter(); //tells to the parent that the service has been modified

    constructor(private invokableReporterModals: InvokableReporterModalServices) {}
    
    private editInvocation() {
        this.invokableReporterModals.openServiceInvocationEditor("Edit Service invocation", this.invocation.reporterId, this.invocation).then(
            () => {
                this.update.emit();
            },
            () => {}
        )
    }

}