import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Configuration } from "../../models/Configuration";
import { CustomOperation, CustomOperationForm, CustomOperationFormEntry, TypeUtils, OperationType, OperationParameter } from "../../models/CustomService";
import { CustomServiceServices } from "../../services/customServices";
import { SettingsProp } from "../../models/Plugins";

export class CustomOperationEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public operation?: CustomOperation) {
        super();
    }
}

@Component({
    selector: "custom-operation-editor-modal",
    templateUrl: "./customOperationEditorModal.html",
    styleUrls: ["../customServices.css"]
})
export class CustomOperationEditorModal implements ModalComponent<CustomOperationEditorModalData> {
    context: CustomOperationEditorModalData;

    private formConfigurations: Configuration[];
    private selectedFormConf: Configuration;

    private form: CustomOperationForm;

    private returnsPrettyPrint: string;

    constructor(private customServService: CustomServiceServices, public dialog: DialogRef<CustomOperationEditorModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.customServService.getOperationForms().subscribe(
            (formConfigs: Configuration[]) => {
                this.formConfigurations = formConfigs;
                if (this.context.operation != null) { // edit mode
                    this.restoreOperation(this.context.operation);
                } else if (this.formConfigurations.length == 1) {
                    this.selectedFormConf = this.formConfigurations[0];
                    this.onFormConfigurationChanged();
                }
            }
        );
    }

    /**
     * Create and fill a form according the given custom operation to edit
     * @param operation 
     */
    private restoreOperation(operation: CustomOperation) {
        this.selectedFormConf = this.formConfigurations.find(t => t.type == operation['@type']);
        this.onFormConfigurationChanged();
        Object.keys(operation).forEach(p => {
            if (this.form[p] != null) { //check if such field is foreseen by the form
                this.form[p].value = operation[p];
            }
        });
        this.updateReturnsPrettyPrint();
    }

    /**
     * Update the form when the chosen form configuration changes
     */
    private onFormConfigurationChanged() {
        this.form = {}
        this.selectedFormConf.properties.forEach(p => {
            let formEntry: CustomOperationFormEntry = {
                name: p.name,
                displayName: p.displayName,
                description: p.description,
                required: p.required,
                value: p.value
            };
            this.form[p.name] = formEntry;
        })
    }

    private updateReturnsPrettyPrint() {
        if (this.form.returns != null && this.form.returns.value != null) {
            this.returnsPrettyPrint = TypeUtils.serializeType(this.form.returns.value);
        }
    }

    ok() {
        //check if form is ok
        //copy the value of the form into the configuration

        for (let fieldName in this.form) {
            let field: CustomOperationFormEntry = this.form[fieldName];
            /**
             * field incomplete if required but:
             * - null
             * - empty string
             * - empty array
             */
            if (field.required && (
                    field.value == null || (
                        (typeof field.value == "string" && field.value.trim() == "") || 
                        (field.value instanceof Array && field.value.length == 0)
                    )
                )
            ) {
                alert(fieldName + " not configured TODO");
                return;
            } else {
                if (fieldName == "returns") { //check that the type is completed
                    let returnType: OperationType = field.value;
                    if (!TypeUtils.isOperationTypeValid(returnType)) {
                        alert(fieldName + " incomplete TODO");
                        return
                    }
                } else if (fieldName == "parameters") { //check that the parameters are completed
                    let parameters: OperationParameter[] = field.value;
                    for (let param of parameters) {
                        //TODO check
                    }
                }
            }
        }

        alert("TODO");
        this.cancel();
        
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}