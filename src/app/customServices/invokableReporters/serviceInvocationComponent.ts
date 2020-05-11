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
        alert("TODO");
        
        /* 
        I need a service that given a service name and an operation name, returns the CustomOperation description, so that I can provide an edit form:
        namely a form with service name, operation name and parameters
         */
        // this.invokableReporterModals.openServiceInvocationEditor("Edit service invocation", this.invocation.reporterId, this.invocation).then(
        //     ()=> {
        //         this.update.emit();
        //     },
        //     () => {}
        // )
    }

}