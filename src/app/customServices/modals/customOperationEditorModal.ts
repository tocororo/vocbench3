import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Configuration } from "../../models/Configuration";
import { CustomOperation, CustomOperationDefinition, CustomOperationTypes, OperationParameter, OperationType, SPARQLOperation, TypeUtils } from "../../models/CustomService";
import { QueryChangedEvent } from "../../models/Sparql";
import { CustomServiceServices } from "../../services/customServiceServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class CustomOperationEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public operation?: CustomOperationDefinition) {
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

    private customOperations: CustomOperation[];
    private selectedCustomOperation: CustomOperation;

    private form: CustomOperationForm;


    private returnsPrettyPrint: string;
    private queryValid: boolean = true; //unless otherwise stated bu the yasgui component, the query is considered valid

    constructor(private customServService: CustomServiceServices, private basicModals: BasicModalServices,
        public dialog: DialogRef<CustomOperationEditorModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.customServService.getOperationForms().subscribe(
            (formConfigs: Configuration[]) => {
                this.customOperations = formConfigs;
                if (this.context.operation != null) { // edit mode
                    this.restoreOperation(this.context.operation);
                } else if (this.customOperations.length == 1) {
                    this.selectedCustomOperation = this.customOperations[0];
                    this.onOperationChanged();
                }
            }
        );
    }

    /**
     * Create and fill a form according the given custom operation to edit
     * @param operation 
     */
    private restoreOperation(operation: CustomOperationDefinition) {
        this.selectedCustomOperation = this.customOperations.find(t => t.type == operation['@type']);
        this.onOperationChanged();
        Object.keys(operation).forEach(p => {
            if (this.form[p] != null) { //check if such field is foreseen by the form
                //with parse+stringify made a copy by value (not by reference) of the value preventing changes on the original operation
                this.form[p].value = JSON.parse(JSON.stringify(operation[p]));
            }
        });
        this.updateReturnsPrettyPrint();
    }

    /**
     * Update the form when the chosen custom operation configuration changes
     */
    private onOperationChanged() {
        this.form = {}
        this.selectedCustomOperation.properties.forEach(p => {
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

    //PARAMETERS

    private addParameter() {
        let parameters: OperationParameter[] = (<OperationParameter[]>this.form.parameters.value);
        if (parameters == null) {
            parameters = [];
        }
        parameters.push({ name: null, required: false, type: null});
        this.form.parameters.value = parameters;
    }

    private removeParameter(par: OperationParameter) {
        let parameters: OperationParameter[] = (<OperationParameter[]>this.form.parameters.value);
        parameters.splice(parameters.indexOf(par), 1);
    }

    //RETURN TYPE
    private updateReturnsPrettyPrint() {
        if (this.form.returns != null && this.form.returns.value != null) {
            this.returnsPrettyPrint = TypeUtils.serializeType(this.form.returns.value);
        }
    }

    //SPARQL

    private onQueryChange(event: QueryChangedEvent) {
        this.form.sparql.value = event.query;
        this.queryValid = event.valid;
    }

    ok() {
        //check if form is ok
        for (let fieldName in this.form) {
            let field: CustomOperationFormEntry = this.form[fieldName];
            /**
             * field incomplete if required but:
             * - value is null
             * - value is not null but an empty string
             * - value is not null but an empty array
             */
            if (
                field.required && (
                    field.value == null || (
                        (typeof field.value == "string" && field.value.trim() == "") || 
                        (field.value instanceof Array && field.value.length == 0)
                    )
                )
            ) {
                this.basicModals.alert("Invalid data", "The required field " + fieldName + " is missing", "warning");
                return;
            } else { //ad hoc checks
                let validNameRegexp = new RegExp("^[a-zA-Z_$][a-zA-Z_$0-9]*$");
                if (fieldName == "name" && !validNameRegexp.test(field.value)) { //check that the name is valid
                    this.basicModals.alert("Invalid data", "The name " + field.value + " is not valid", "warning");
                    return;
                }
                if (fieldName == "returns") { //check that the type is completed
                    let returnType: OperationType = field.value;
                    if (!TypeUtils.isOperationTypeValid(returnType)) {
                        this.basicModals.alert("Invalid data", "The provided Returns type is not valid", "warning");
                        return;
                    }
                }
                if (fieldName == "parameters") { //check that the parameters are completed
                    let parameters: OperationParameter[] = field.value;
                    for (let param of parameters) {
                        if (param.name == null) { //all parameter names must be provided
                            this.basicModals.alert("Invalid data", "An invalid parameter name has been detected, The provided Returns type is not valid", "warning");
                            return;
                        } else if (!validNameRegexp.test(param.name)) { //all parameter names must be valid variable name
                            this.basicModals.alert("Invalid data", "The parameter name " + param.name + " is not valid", "warning");
                            return;
                        } else if (!TypeUtils.isOperationTypeValid(param.type)) {
                            this.basicModals.alert("Invalid data", "The type of the parameter " + param.name + " is not valid", "warning");
                            return;
                        }
                    }
                }
                if (fieldName == "sparql" && !this.queryValid) {
                    this.basicModals.alert("Invalid data", "The provided SPARQL query is not valid", "warning");
                    return;
                }
            }
        }
        //all fields are ok, now copy the value of the form into the configuration
        let returnOperation: CustomOperationDefinition = {
            "@type": this.selectedCustomOperation.type,
            name: this.form.name.value,
            authorization: this.form.authorization.value,
            returns: this.form.returns.value,
            parameters: this.form.parameters.value
        }
        if (returnOperation["@type"] == CustomOperationTypes.SparqlOperation) {
            (<SPARQLOperation>returnOperation).sparql = this.form.sparql.value;
        }

        if (this.context.operation != null) { //edit => check if something is changed
            let changed: boolean = false;
            for (let operationField in this.context.operation) {
                if (JSON.stringify(this.context.operation[operationField]) != JSON.stringify(returnOperation[operationField])) {
                    changed = true;
                }
            }
            if (changed) {
                this.dialog.close(returnOperation);
            } else {
                this.cancel();
            }
        } else {
            this.dialog.close(returnOperation);
        }

    }

    cancel() {
        this.dialog.dismiss();
    }
    
}

interface CustomOperationForm { [key: string]: CustomOperationFormEntry }

interface CustomOperationFormEntry {
    name: string;
    displayName: string;
    description: string;
    required: boolean;
    value: any;
}