import { Component, Input, SimpleChanges } from "@angular/core";
import { ConfigurationComponents } from "../../models/Configuration";
import { CustomOperationDefinition } from "../../models/CustomService";
import { InvokableReporter, ServiceInvocationDefinition, InvokableReporterDefinition } from "../../models/InvokableReporter";
import { ConfigurationsServices } from "../../services/configurationsServices";
import { InvokableReporterModalServices } from "./modals/invokableReporterModalServices";
import { InvokableReportersServices } from "../../services/invokableReportersServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "invokable-reporter",
    templateUrl: "./invokableReporterComponent.html",
    host: { class: "vbox" },
    styleUrls: ["../customServices.css"]
})
export class InvokableReporterComponent {
    @Input() id: string;

    private reporter: InvokableReporter;
    private selectedServiceInvocation: ServiceInvocationDefinition;

    private form: InvokableReporterForm;

    constructor(private configurationService: ConfigurationsServices, private invokableReporterService: InvokableReportersServices,
        private invokableReporterModals: InvokableReporterModalServices, private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['id'] && changes['id'].currentValue) {
            this.initReporter(false);
        }
    }

    private initReporter(restoreInvocation: boolean) {
        this.configurationService.getConfiguration(ConfigurationComponents.INVOKABLE_REPORER_STORE, "sys:" + this.id).subscribe(
            conf => {
                this.reporter = conf;
                this.form = {
                    label: this.reporter.getProperty("label"),
                    description: this.reporter.getProperty("description"),
                    serviceInvocations: this.reporter.getProperty("serviceInvocations")
                }

                if (restoreInvocation) {
                    //try to restore the selected service invocation (if any)
                    if (this.selectedServiceInvocation != null) {
                    //     let selectedOpName: string = this.selectedOperation.name;
                    //     let operations: CustomOperationDefinition[] = this.form.operations.value;
                    //     // if (operations != null) {
                    //         this.selectedOperation = operations.find(o => o.name == selectedOpName);
                    //     // } else {
                    //     //     this.selectedOperation = null;
                    //     // }
                    }
                } else {
                    this.selectedServiceInvocation = null;
                }
            }
        )
    }

    private compileReport() {
        if (this.form.serviceInvocations.value == null || this.form.serviceInvocations.value.length == 0) {
            this.basicModals.alert("Compile report", "The reporter cannot be compiled since it has no service invocation provided", "warning");
        } else {
            this.invokableReporterService.compileReport("sys:" + this.id).subscribe(
                report => {
                    this.basicModals.alert("TODO", JSON.stringify(report.sections));
                }
            );
        }
        
    }
    
    private updateLabel(newLabel: string) {
        let updatedReporter: InvokableReporterDefinition = { label: newLabel, description: this.form.description.value, serviceInvocations: this.form.serviceInvocations.value };
        this.configurationService.storeConfiguration(ConfigurationComponents.INVOKABLE_REPORER_STORE, "sys:" + this.id, updatedReporter).subscribe(
            () => {
                this.initReporter(true)
            }
        )
    }

    private updateDescription(newDescription: string) {
        let updatedReporter: InvokableReporterDefinition = { label: this.form.label.value, description: newDescription, serviceInvocations: this.form.serviceInvocations.value };
        this.configurationService.storeConfiguration(ConfigurationComponents.INVOKABLE_REPORER_STORE, "sys:" + this.id, updatedReporter).subscribe(
            () => {
                this.initReporter(true)
            }
        )
    }

    private selectServiceInvocation(invocation: ServiceInvocationDefinition) {
        if (this.selectedServiceInvocation != invocation) {
            this.selectedServiceInvocation = invocation;
        }
    }

    private createServiceInvocation() {
        this.invokableReporterModals.openServiceInvocationEditor("Create Service invocation", this.reporter.id).then(
            () => { //operation created => require update
                this.initReporter(true);
            },
            () => { }
        )
    }

    private deleteServiceInvocation() {
        let idx = this.form.serviceInvocations.value.indexOf(this.selectedServiceInvocation);
        this.form.serviceInvocations.value.splice(idx, 1);
        let updatedReporter: InvokableReporterDefinition = { label: this.form.label.value, description: this.form.description.value, serviceInvocations: this.form.serviceInvocations.value };
        this.configurationService.storeConfiguration(ConfigurationComponents.INVOKABLE_REPORER_STORE, "sys:" + this.id, updatedReporter).subscribe(
            () => {
                this.initReporter(true)
            }
        )
    }

    private onServiceInvocationUpdate() {
        //a service invocation of the reporter changed => require update
        this.initReporter(true);
    }

    // private reload() {
    //     this.customServService.reloadCustomService(this.id).subscribe(
    //         () => {
    //             this.initCustomService(true);
    //         }
    //     )
    // }

}


interface InvokableReporterForm {
    label: InvokableReporterFormEntry<string>;
    description: InvokableReporterFormEntry<string>;
    serviceInvocations: InvokableReporterFormEntry<ServiceInvocationDefinition[]>;
}

interface InvokableReporterFormEntry<T> {
    // name: string;
    displayName: string;
    description: string;
    required: boolean;
    value: T;
}