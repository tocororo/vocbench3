import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { CustomOperationDefinition, CustomService, CustomServiceDefinition, OperationParameter, TypeUtils, OperationType } from "../../../models/CustomService";
import { ServiceInvocationDefinition } from "../../../models/InvokableReporter";
import { CustomServiceServices } from "../../../services/customServiceServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CustomServiceModalServices } from "../../customServicesEditor/modals/customServiceModalServices";
import { Observable } from "rxjs";

export class ServiceInvocationEditorModalData extends BSModalContext {
    /**
     * @param title 
     * @param invokableReporterId needed for the creation/edit of the invocation
     * @param serviceInvocation if provided, allows the edit of the invocation
     */
    constructor(public title: string = 'Modal Title', public invokableReporterId: string, public serviceInvocation?: ServiceInvocationDefinition) {
        super();
    }
}

@Component({
    selector: "service-invocation-editor-modal",
    templateUrl: "./serviceInvocationEditorModal.html",
    styleUrls: ["../../customServices.css"],
})
export class ServiceInvocationEditorModal implements ModalComponent<ServiceInvocationEditorModalData> {
    context: ServiceInvocationEditorModalData;

    private customServiceIds: string[];
    private selectedServiceId: string;
    private selectedService: CustomServiceDefinition;
    private selectedOperation: CustomOperationDefinition;
    private parameters: EditableParamStruct[]; //list of editable parameter structures

    constructor(private customServService: CustomServiceServices, private basicModals: BasicModalServices, private customServiceModals: CustomServiceModalServices,
        public dialog: DialogRef<ServiceInvocationEditorModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.customServService.getCustomServiceIdentifiers().subscribe(
            (serviceIds) => {
                this.customServiceIds = serviceIds;

                if (this.context.serviceInvocation != null) { //edit => restore the operation
                    /* Here I need a service that given a service name, returns the id of the related CustomService.
                    * In this way I can retrieve the CustomServiceDefinition via CustomServices.getCustomService(id),
                    * then I can select the CustomOperation with name == serviceInvocation.service and I can properly show the arguments editor
                    */
                   alert("TODO: service invocation edit still not available")
                    // let customServiceId = ???;
                    // this.selectService(customServiceId).subscribe(
                    //     () => {
                    //         let operationToSelect = this.selectedService.operations.find(o => o.name == this.context.serviceInvocation.operation);
                    //         this.selectOperation(operationToSelect);
                    //         this.parameters.forEach(p => {
                    //             /**
                    //              * here I should restore the param value into the proper EditableParamStruct,
                    //              * but since in the service invocation the arguments are stored as plain string, I don't know
                    //              * which string corresponds to which parameter
                    //              */
                    //         })
                    //     }
                    // );
                }
            }
        );
    }

    private selectService(id: string): Observable<void> {
        if (this.selectedServiceId != id) {
            this.selectedServiceId = id;
            //init the selected custom service
            return this.initCustomService(this.selectedServiceId);
        } else {
            return Observable.of(null);
        }
    }

    private initCustomService(id: string): Observable<void> {
        return this.customServService.getCustomService(id).map(
            (conf: CustomService) => {
                this.selectedService = {
                    name: conf.getPropertyValue("name"),
                    description: conf.getPropertyValue("description"),
                    operations: conf.getPropertyValue("operations")
                };
                this.selectedOperation = null;
                this.parameters = null;
            }
        );
    }

    private selectOperation(operation: CustomOperationDefinition) {
        if (this.selectedOperation != operation) {
            this.selectedOperation = operation;
            this.parameters = [];
            if (this.selectedOperation.parameters != null) {
                this.selectedOperation.parameters.forEach(p => {
                    this.parameters.push({ param: p, show: TypeUtils.serializeParameter(p), value: null });
                })
            }
        }
    }

    private describeSelectedOperation() {
        //open a read-only modal for custom operation
        this.customServiceModals.openCustomOperationView(this.selectedOperation);
    }


    private isDataValid(): boolean {
        if (this.selectedOperation != null) { //operation selected => check if it has parameters and in case if they are set
            if (this.selectedOperation.returns.name == TypeUtils.Types.void) {
                return false; //update operation cannot be used in reporter
            } else {
                return true;
            }
        } 
        return false; //no operation selected => cannot confirm
    }

    ok() {

        if (this.parameters != null) { //check if those required are provided
            for (let p of this.parameters) {
                if (p.param.required && p.value == null || p.value.trim() == "") {
                    this.basicModals.alert("Service invocation", "The required parameter '" + p.param.name + "' is missing", "warning");
                    return false; //a required param is not set
                }
            }
        }

        let newServiceInvocation: ServiceInvocationDefinition = {
            service: this.selectedService.name,
            operation: this.selectedOperation.name,
            arguments: this.parameters.map(p =>  p.value )
        }
        if (this.dialog.context.serviceInvocation == null) { //create
            //here I expect a service (still not available) that given the reporter ID, add a new service invocation
            alert("TODO (service still not available)\nAdding a new service invocation:\n" + 
                JSON.stringify(newServiceInvocation, null, 2) + 
                "\nto reporter " + this.context.invokableReporterId);
        } else { //edit
            //here I expect a service (still not available) that given the reporter ID, edit an existing service invocation
            alert("TODO (service still not available)\nUpdating service invocation:\n" + 
                JSON.stringify(newServiceInvocation, null, 2) +
                "\nin reporter " + this.context.invokableReporterId);
        }
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}

// interface ServiceInvokationForm { [key: string]: ServiceInvokationFormEntry }

// interface ServiceInvokationFormEntry {
//     name: string;
//     displayName: string;
//     description: string;
//     required: boolean;
//     value: any;
// }

interface EditableParamStruct {
    param: OperationParameter;
    show: string;
    value: string;
}