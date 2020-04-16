import { Component, Input, SimpleChanges } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { CustomOperation, CustomService } from "../models/CustomService";
import { CustomOperationEditorModal, CustomOperationEditorModalData } from "./modals/customOperationEditorModal";
import { Configuration } from "../models/Configuration";
import { SettingsProp } from "../models/Plugins";

@Component({
    selector: "custom-service",
    templateUrl: "./customServiceComponent.html",
    host: { class: "vbox" },
    styleUrls: ["./customServices.css"]
})
export class CustomServiceComponent {

    @Input() serviceConfiguration: Configuration;

    private selectedOperation: CustomOperation;

    private form: Form;

    constructor(private modal: Modal) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['serviceConfiguration'] && changes['serviceConfiguration'].currentValue) {
            this.form = {}
            this.serviceConfiguration.properties.forEach(p => {
                let formEntry: FormEntry = {
                    name: p.name,
                    displayName: p.displayName,
                    description: p.description,
                    required: p.required,
                    value: p.value
                };
                this.form[p.name] = formEntry;
            })
        }
    }

    private selectOperation(operation: CustomOperation) {
        if (this.selectedOperation != operation) {
            this.selectedOperation = operation;
        }
    }

    private createOperation() {
        this.openCustomOperationEditor("Create Custom Operation").then(
            (newOperation: CustomOperation) => {

            },
            () => {}
        )
    }

    private editOperation() {
        this.openCustomOperationEditor("Edit Custom Operation", this.selectedOperation).then(
            (updatedOperation: CustomOperation) => {

            },
            () => {}
        )
    }

    private deleteOperation() {
        alert("TODO");
    }

    private openCustomOperationEditor(title: string, operation?: CustomOperation) {
        let modalData = new CustomOperationEditorModalData(title, operation);
        const builder = new BSModalContextBuilder<CustomOperationEditorModalData>(
            modalData, undefined, CustomOperationEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(CustomOperationEditorModal, overlayConfig).result;
    }

}

interface Form { [key: string]: FormEntry }

interface FormEntry {
    name: string;
    displayName: string;
    description: string;
    required: boolean;
    value: any;
}