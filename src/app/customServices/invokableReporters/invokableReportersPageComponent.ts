import { Component } from "@angular/core";
import { ConfigurationComponents, Reference } from "../../models/Configuration";
import { ConfigurationsServices } from "../../services/configurationsServices";
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

    constructor(private configurationService: ConfigurationsServices, private invokableReporterModals: InvokableReporterModalServices, 
        private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.initReporters();
    }

    private initReporters() {
        this.configurationService.getConfigurationReferences(ConfigurationComponents.INVOKABLE_REPORER_STORE).subscribe(
            references => {
                this.reporters = references;
            }
        );
    }

    private selectReporter(reporter: Reference) {
        this.selectedReporter = reporter;
    }

    private createReporter() {
        this.invokableReporterModals.openInvokableReporterEditor("New Invokable Reporter").then(
            () => {
                this.initReporters();
            },
            () => {}
        )
    }

    private deleteReporter() {
        this.basicModals.confirm("Delete Invokable Reporter", "You are deleting the Invokable Reporter '" + this.selectedReporter.identifier + "'. Are you sure?", "warning").then(
            () => {
                this.configurationService.deleteConfiguration(ConfigurationComponents.INVOKABLE_REPORER_STORE, this.selectedReporter.relativeReference).subscribe(
                    () => {
                        this.initReporters();
                    }
                )
            }
        )
    }

}