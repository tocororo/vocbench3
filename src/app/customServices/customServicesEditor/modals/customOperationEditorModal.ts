import { Component } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { Configuration } from "../../../models/Configuration";
import { CustomOperation, CustomOperationDefinition, CustomOperationTypes, OperationParameter, OperationType, SPARQLOperation, TypeUtils } from "../../../models/CustomService";
import { QueryChangedEvent } from "../../../models/Sparql";
import { CustomServiceServices } from "../../../services/customServiceServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AuthorizationHelperModal, AuthorizationHelperModalData } from "./authorizationHelperModal";
var $: JQueryStatic = require('jquery');

export class CustomOperationEditorModalData extends BSModalContext {
    /**
     * @param title 
     * @param customServiceId needed for the creation/edit of the operation
     * @param operation if provided, allows the edit of the operation
     */
    constructor(public title: string = 'Modal Title', public customServiceId: string, public operation?: CustomOperationDefinition) {
        super();
    }
}

@Component({
    selector: "custom-operation-editor-modal",
    templateUrl: "./customOperationEditorModal.html",
    styleUrls: ["../../customServices.css"],
})
export class CustomOperationEditorModal implements ModalComponent<CustomOperationEditorModalData> {
    context: CustomOperationEditorModalData;

    private customOperations: CustomOperation[];
    private selectedCustomOperation: CustomOperation;

    private form: CustomOperationForm;

    private returnsPrettyPrint: string;
    private queryValid: boolean = true; //unless otherwise stated bu the yasgui component, the query is considered valid

    constructor(private customServService: CustomServiceServices, private basicModals: BasicModalServices,
        public dialog: DialogRef<CustomOperationEditorModalData>, private modal: Modal) {
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
        //in case the sparql editor is available, enable the popover button
        setTimeout(() => {
            let popoverBtn: any =$('[data-toggle="popover"]'); //defined as any since .popover() is not recognized as function (no @types for bootstrap)
            if (popoverBtn != null) {
                let popoverHtmlContent: string = `
                <p>The parameters are mapped to eponym variables in the SPARQL query.
                    Actual parameters passed to a service upon invocation are pre-bound to the corresponding variable in the SPARQL query.
                    A reserved variable is <span style="font-family: monospace">workingGraph</span>,
                    which is bound by default to the working graph of the project.</p>
                <p>The allowed parameter types are:</p>
                <ul>
                    <li><span style="font-family: monospace">boolean</span></li>
                    <li><span style="font-family: monospace">integer</span></li>
                    <li><span style="font-family: monospace">short</span></li>
                    <li><span style="font-family: monospace">long</span></li>
                    <li><span style="font-family: monospace">float</span></li>
                    <li><span style="font-family: monospace">double</span></li>
                    <li><span style="font-family: monospace">java.lang.String</span></li>
                    <li><span style="font-family: monospace">BNode</span></li>
                    <li><span style="font-family: monospace">IRI</span></li>
                    <li><span style="font-family: monospace">Literal</span></li>
                    <li><span style="font-family: monospace">Resource</span></li>
                    <li><span style="font-family: monospace">Value</span></li>
                </ul>
                <p>The allowed return type depends on the actual SPARQL operation:</p>
                <ul>
                    <li>Udpate => <span style="font-family: monospace;">void</span></li>
                    <li>ASK => <span style="font-family: monospace;">boolean</span></li>
                    <li>SELECT => 
                        <span style="font-family: monospace;">List&lt;T&gt;</span>, where <span style="font-family: monospace;">T</span>
                        <ul>
                            <li>might be any of the above accepted parameter types (in this case the SELECT must return one variable)</li>
                            <li>be <span style="font-family: monospace;">AnnotatedValue&lt;S&gt;</span> where <span style="font-family: monospace;">S</span> might be:
                                <ul>
                                    <li><span style="font-family: monospace;">BNode</span></li>
                                    <li><span style="font-family: monospace;">IRI</span></li>
                                    <li><span style="font-family: monospace;">Resource</span></li>
                                </ul>
                                (in this case the SELECT must return one variable plus additional variables <span style="font-family: monospace;">?attr_...</span> for additional attibutes)
                            </li>
                        </ul>
                    </li>
                </ul>`;
                popoverBtn.popover({ 
                    title: "SPQARL Custom Service istructions",
                    content: popoverHtmlContent, 
                    html: true,
                    placement: "left",
                });
            }
        });
    }

    //AUTHORIZATION

    private authorizationHelper() {
        let paramNames: string[] = [];
        let parameters: OperationParameter[] = (<OperationParameter[]>this.form.parameters.value);
        if (parameters != null) {
            paramNames = parameters.map(p => p.name);
        }
        let authValue: string = this.form.authorization.value;
        if (authValue != null && authValue.trim() == "") {
            authValue = null;
        }
        let modalData = new AuthorizationHelperModalData(authValue, paramNames);
        const builder = new BSModalContextBuilder<AuthorizationHelperModalData>(
            modalData, undefined, AuthorizationHelperModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(AuthorizationHelperModal, overlayConfig).result.then(
            auth => {
                this.form.authorization.value = auth;
            }
        );
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
                    if (parameters != null) {
                        for (let param of parameters) {
                            if (param.name == null) { //all parameter names must be provided
                                this.basicModals.alert("Invalid data", "A provided parameter has an empty name", "warning");
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
                }
                if (fieldName == "sparql" && !this.queryValid) {
                    this.basicModals.alert("Invalid data", "The provided SPARQL query is not valid", "warning");
                    return;
                }
            }
        }
        //all fields are ok, now copy the value of the form into the configuration
        let newOperation: CustomOperationDefinition = {
            "@type": this.selectedCustomOperation.type,
            name: this.form.name.value,
            returns: this.form.returns.value,
            parameters: this.form.parameters.value,
        }
        if (this.form.authorization.value != null && this.form.authorization.value.trim() != "") {
            newOperation.authorization = this.form.authorization.value;
        }
        if (newOperation["@type"] == CustomOperationTypes.SparqlOperation) {
            (<SPARQLOperation>newOperation).sparql = this.form.sparql.value;
        }

        if (this.context.operation != null) { //edit => check if something is changed
            newOperation.serviceId = this.context.customServiceId; //needed just for the comparison, in order to not make it wrongly report as changed
            let changed: boolean = false;

            //first compare only the fields of the two operations (pristine and new one)
            let pristineFields = Object.keys(this.context.operation).sort();
            let updatedFields = Object.keys(newOperation).sort();
            changed = JSON.stringify(pristineFields) != JSON.stringify(updatedFields);

            if (!changed) { //fields not changed => compare the contents
                for (let operationField of pristineFields) {
                    if (JSON.stringify(this.context.operation[operationField]) != JSON.stringify(newOperation[operationField])) {
                        changed = true;
                    }
                }
            }

            if (changed) { //changed => update
                this.customServService.updateOperationInCustomService(this.context.customServiceId, newOperation).subscribe(
                    ()=> {
                        this.dialog.close();
                    }
                );
            } else {
                this.cancel();
            }
        } else { //create
            this.customServService.addOperationToCustomService(this.context.customServiceId, newOperation).subscribe(
                ()=> {
                    this.dialog.close();
                }
            );
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