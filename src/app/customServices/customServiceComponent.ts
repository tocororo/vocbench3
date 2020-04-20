import { Component, Input, SimpleChanges, Output, EventEmitter } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { CustomOperationDefinition, CustomService } from "../models/CustomService";
import { CustomOperationEditorModal, CustomOperationEditorModalData } from "./modals/customOperationEditorModal";
import { CustomServiceServices } from "../services/customServiceServices";

@Component({
    selector: "custom-service",
    templateUrl: "./customServiceComponent.html",
    host: { class: "vbox" },
    styleUrls: ["./customServices.css"]
})
export class CustomServiceComponent {
    @Input() service: CustomService;
    @Output() update: EventEmitter<void> = new EventEmitter(); //tells to the parent that the service has been modified

    private form: CustomServiceForm;

    private selectedOperation: CustomOperationDefinition;

    constructor(private customServService: CustomServiceServices, private modal: Modal) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['service'] && changes['service'].currentValue) {
            //copy the value of the input service into the form
            this.form = {
                name: this.service.getProperty("name"),
                description: this.service.getProperty("description"),
                operations: this.service.getProperty("operations")
            }
            //try to restore the selected operation (if any)
            if (this.selectedOperation != null) {
                let selectedOpName: string = this.selectedOperation.name; 
                let operations: CustomOperationDefinition[] = this.form.operations.value;
                if (operations != null) {
                    this.selectedOperation = operations.find(o => o.name == selectedOpName);
                } else {
                    this.selectedOperation = null;
                }
            }
        }
    }

    private selectOperation(operation: CustomOperationDefinition) {
        if (this.selectedOperation != operation) {
            this.selectedOperation = operation;
        }
    }

    private createOperation() {
        this.openCustomOperationEditor("Create Custom Operation").then(
            (newOperation: CustomOperationDefinition) => {
                this.customServService.addOperationToCustomService(this.service.id, newOperation).subscribe(
                    ()=> {
                        this.update.emit();
                    }
                );
            },
            () => {}
        )
    }

    private editOperation() {
        this.openCustomOperationEditor("Edit Custom Operation", this.selectedOperation).then(
            (updatedOperation: CustomOperationDefinition) => {
                this.customServService.updateOperationInCustomService(this.service.id, updatedOperation).subscribe(
                    ()=> {
                        this.update.emit();
                    }
                );
            },
            () => {}
        )
    }

    private deleteOperation() {
        this.customServService.removeOperationFromCustomService(this.service.id, this.selectedOperation.name).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    private openCustomOperationEditor(title: string, operation?: CustomOperationDefinition) {
        let modalData = new CustomOperationEditorModalData(title, operation);
        const builder = new BSModalContextBuilder<CustomOperationEditorModalData>(
            modalData, undefined, CustomOperationEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(CustomOperationEditorModal, overlayConfig).result;
    }

}

interface CustomServiceForm { 
    name: CustomServiceFormEntry<string>;
    description: CustomServiceFormEntry<string>;
    operations: CustomServiceFormEntry<CustomOperationDefinition[]>;
}

interface CustomServiceFormEntry<T> {
    // name: string;
    displayName: string;
    description: string;
    required: boolean;
    value: T;
}