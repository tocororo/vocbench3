import { Component, Input, SimpleChanges } from "@angular/core";
import { CustomOperationDefinition, CustomService, CustomServiceDefinition } from "../models/CustomService";
import { CustomServiceServices } from "../services/customServiceServices";
import { CustomServiceModalServices } from "./modals/customServiceModalServices";

@Component({
    selector: "custom-service",
    templateUrl: "./customServiceComponent.html",
    host: { class: "vbox" },
    styleUrls: ["./customServices.css"]
})
export class CustomServiceComponent {
    @Input() id: string;

    private service: CustomService;
    private form: CustomServiceForm;
    private selectedOperation: CustomOperationDefinition;

    constructor(private customServService: CustomServiceServices, private customServiceModals: CustomServiceModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['id'] && changes['id'].currentValue) {
            this.initCustomService(false);
        }
    }

    /**
     * 
     * @param restoreOperation when an operation of the current service is updated/added/deleted the whole custom service is
     * re-initialized. In some cases (e.g. update) the current selected operation needs to stays selected, so this parameter
     * is useful to distinguish those case where the selected operation needs to be selected again and those where the selected 
     * operation must be reset
     */
    private initCustomService(restoreOperation: boolean) {
        return this.customServService.getCustomService(this.id).subscribe(
            (conf: CustomService) => {
                this.service = conf;
                //copy the value of the input service into the form
                this.form = {
                    name: this.service.getProperty("name"),
                    description: this.service.getProperty("description"),
                    operations: this.service.getProperty("operations")
                }
                if (restoreOperation) {
                    //try to restore the selected operation (if any)
                    if (this.selectedOperation != null) {
                        let selectedOpName: string = this.selectedOperation.name;
                        let operations: CustomOperationDefinition[] = this.form.operations.value;
                        // if (operations != null) {
                            this.selectedOperation = operations.find(o => o.name == selectedOpName);
                        // } else {
                        //     this.selectedOperation = null;
                        // }
                    }
                } else {
                    this.selectedOperation = null;
                }
                
            }
        )
    }
    
    private updateName(newName: string) {
        let updatedService: CustomServiceDefinition = { name: newName, description: this.form.description.value, operations: this.form.operations.value };
        this.customServService.updateCustomService(this.id, updatedService).subscribe(
            () => {
                this.initCustomService(true);
            }
        );
    }

    private updateDescription(newDescription: string) {
        let updatedService: CustomServiceDefinition = { name: this.form.name.value, description: newDescription, operations: this.form.operations.value };
        this.customServService.updateCustomService(this.id, updatedService).subscribe(
            () => {
                this.initCustomService(true);
            }
        );
    }

    private selectOperation(operation: CustomOperationDefinition) {
        if (this.selectedOperation != operation) {
            this.selectedOperation = operation;
        }
    }

    private createOperation() {
        this.customServiceModals.openCustomOperationEditor("Create Custom Operation", this.service.id).then(
            () => { //operation created => require update
                this.initCustomService(true);
            },
            () => { }
        )
    }

    private deleteOperation() {
        this.customServService.removeOperationFromCustomService(this.service.id, this.selectedOperation.name).subscribe(
            () => { //operation deleted => require update
                this.initCustomService(false);
            }
        );
    }

    private onOperationUpdate() {
        //an operation of the service changed => require update
        this.initCustomService(true);
    }

    private reload() {
        this.customServService.reloadCustomService(this.id).subscribe(
            () => {
                this.initCustomService(true);
            }
        )
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