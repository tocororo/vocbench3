import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { CustomOperationDefinition, CustomService, CustomServiceDefinition, OperationParameter, TypeUtils, OperationType } from "../../../models/CustomService";
import { ServiceInvocationDefinition } from "../../../models/InvokableReporter";
import { CustomServiceServices } from "../../../services/customServiceServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CustomServiceModalServices } from "../../customServicesEditor/modals/customServiceModalServices";

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
    private parameters: { param: OperationParameter, show: string, value: string }[]; //list of editable parameter structures

    constructor(private customServService: CustomServiceServices, private basicModals: BasicModalServices, private customServiceModals: CustomServiceModalServices,
        public dialog: DialogRef<ServiceInvocationEditorModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.dialog.context.serviceInvocation == null) { //creation => allow to select service -> operation -> edit parameters
            this.customServService.getCustomServiceIdentifiers().subscribe(
                (serviceIds) => {
                    this.customServiceIds = serviceIds;
                }
            );
        } else { //edit => allow just to edit parameters

        }
    }

    private selectService(id: string) {
        if (this.selectedServiceId != id) {
            this.selectedServiceId = id;
            //init the selected custom service
            this.customServService.getCustomService(this.selectedServiceId).subscribe(
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

        if (this.dialog.context.serviceInvocation == null) { //create
            //here I expect a service (still not available) that given the reporter ID, add a new service invocation
        } else { //edit
            //here I expect a service (still not available) that given the reporter ID, edit an existing service invocation
        }
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}

interface ServiceInvokationForm { [key: string]: ServiceInvokationFormEntry }

interface ServiceInvokationFormEntry {
    name: string;
    displayName: string;
    description: string;
    required: boolean;
    value: any;
}