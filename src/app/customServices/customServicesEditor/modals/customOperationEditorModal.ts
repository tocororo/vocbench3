import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { Configuration } from "../../../models/Configuration";
import { CustomOperation, CustomOperationDefinition, CustomOperationTypes, OperationParameter, OperationType, SPARQLOperation, TypeUtils } from "../../../models/CustomService";
import { QueryChangedEvent } from "../../../models/Sparql";
import { CustomServiceServices } from "../../../services/customServiceServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AuthorizationHelperModal } from "./authorizationHelperModal";
var $: JQueryStatic = require('jquery');

@Component({
    selector: "custom-operation-editor-modal",
    templateUrl: "./customOperationEditorModal.html",
    styleUrls: ["../../customServices.css"],
})
export class CustomOperationEditorModal {
    @Input() title: string;
    @Input() customServiceId: string; //needed for the creation/edit of the operation
    @Input() operation: CustomOperationDefinition; //if provided, allows the edit of the operation

    customOperations: CustomOperation[];
    selectedCustomOperation: CustomOperation;

    form: CustomOperationForm;

    private returnsPrettyPrint: string;
    private queryValid: boolean = true; //unless otherwise stated bu the yasgui component, the query is considered valid

    constructor(private customServService: CustomServiceServices, private basicModals: BasicModalServices,
        public activeModal: NgbActiveModal, private modalService: NgbModal) {
    }

    ngOnInit() {
        this.customServService.getOperationForms().subscribe(
            (formConfigs: Configuration[]) => {
                this.customOperations = formConfigs;
                if (this.operation != null) { // edit mode
                    this.restoreOperation(this.operation);
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
    onOperationChanged() {
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

        const modalRef: NgbModalRef = this.modalService.open(AuthorizationHelperModal, new ModalOptions());
        modalRef.componentInstance.authorization = authValue;
		modalRef.componentInstance.parameters = paramNames;
        return modalRef.result.then(
            auth => {
                this.form.authorization.value = auth;
            },
            () => {}
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
                this.basicModals.alert({key:"STATUS.INVALID_DATA"}, "The required field " + fieldName + " is missing", ModalType.warning);
                return;
            } else { //ad hoc checks
                let validNameRegexp = new RegExp("^[a-zA-Z_$][a-zA-Z_$0-9]*$");
                if (fieldName == "name" && !validNameRegexp.test(field.value)) { //check that the name is valid
                    this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "The name " + field.value + " is not valid", ModalType.warning);
                    return;
                }
                if (fieldName == "returns") { //check that the type is completed
                    let returnType: OperationType = field.value;
                    if (!TypeUtils.isOperationTypeValid(returnType)) {
                        this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "The provided Returns type is not valid", ModalType.warning);
                        return;
                    }
                }
                if (fieldName == "parameters") { //check that the parameters are completed
                    let parameters: OperationParameter[] = field.value;
                    if (parameters != null) {
                        for (let param of parameters) {
                            if (param.name == null) { //all parameter names must be provided
                                this.basicModals.alert({key:"STATUS.INVALID_DATA"}, "A provided parameter has an empty name", ModalType.warning);
                                return;
                            } else if (!validNameRegexp.test(param.name)) { //all parameter names must be valid variable name
                                this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "The parameter name " + param.name + " is not valid", ModalType.warning);
                                return;
                            } else if (!TypeUtils.isOperationTypeValid(param.type)) {
                                this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "The type of the parameter " + param.name + " is not valid", ModalType.warning);
                                return;
                            }
                        }
                    }
                }
                if (fieldName == "sparql" && !this.queryValid) {
                    this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "The provided SPARQL query is not valid", ModalType.warning);
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

        if (this.operation != null) { //edit => check if something is changed
            newOperation.serviceId = this.customServiceId; //needed just for the comparison, in order to not make it wrongly report as changed
            let changed: boolean = false;

            //first compare only the fields of the two operations (pristine and new one)
            let pristineFields = Object.keys(this.operation).sort();
            let updatedFields = Object.keys(newOperation).sort();
            changed = JSON.stringify(pristineFields) != JSON.stringify(updatedFields);

            if (!changed) { //fields not changed => compare the contents
                for (let operationField of pristineFields) {
                    if (JSON.stringify(this.operation[operationField]) != JSON.stringify(newOperation[operationField])) {
                        changed = true;
                    }
                }
            }

            if (changed) { //changed => update
                this.customServService.updateOperationInCustomService(this.customServiceId, newOperation).subscribe(
                    ()=> {
                        this.activeModal.close();
                    }
                );
            } else {
                this.cancel();
            }
        } else { //create
            this.customServService.addOperationToCustomService(this.customServiceId, newOperation).subscribe(
                ()=> {
                    this.activeModal.close();
                }
            );
        }

    }

    cancel() {
        this.activeModal.dismiss();
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