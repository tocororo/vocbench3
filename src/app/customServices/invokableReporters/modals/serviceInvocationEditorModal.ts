import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { Reference } from "../../../models/Configuration";
import { CustomOperationDefinition, CustomService, CustomServiceDefinition, OperationParameter, TypeUtils } from "../../../models/CustomService";
import { ServiceInvocationDefinition } from "../../../models/InvokableReporter";
import { CustomServiceServices } from "../../../services/customServiceServices";
import { InvokableReportersServices } from "../../../services/invokableReportersServices";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CustomServiceModalServices } from "../../customServicesEditor/modals/customServiceModalServices";

export class ServiceInvocationEditorModalData extends BSModalContext {
    /**
     * @param title 
     * @param invokableReporterRef needed for the creation/edit of the invocation
     * @param serviceInvocation if provided, allows the edit of the invocation.
     *      It contains the invocation definition and the position in the sections array of the invokableReporterRef
     */
    constructor(public title: string = 'Modal Title', public invokableReporterRef: Reference, public serviceInvocation?: { def: ServiceInvocationDefinition, idx: number }) {
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

    private label: string;
    private description: string;
    private template: string;

    private customServiceIds: string[];
    private selectedServiceId: string;
    private selectedService: CustomServiceDefinition;
    private selectedOperation: CustomOperationDefinition;
    private parameters: EditableParamStruct[]; //list of editable parameter structures

    constructor(private customServService: CustomServiceServices, private invokableReporterService: InvokableReportersServices,
        private basicModals: BasicModalServices, private customServiceModals: CustomServiceModalServices,
        public dialog: DialogRef<ServiceInvocationEditorModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.customServService.getCustomServiceIdentifiers().subscribe(
            (serviceIds) => {
                this.customServiceIds = serviceIds;

                if (this.context.serviceInvocation != null) { //edit => restore the operation
                    let invocationDef: ServiceInvocationDefinition = this.context.serviceInvocation.def;
                    this.label = invocationDef.label;
                    this.description = invocationDef.description;
                    this.template = invocationDef.template;
                    
                    this.customServService.getCustomServiceId(invocationDef.service).subscribe(
                        serviceId => {
                            this.selectService(serviceId).subscribe(
                                () => {
                                    let operationToSelect = this.selectedService.operations.find(o => o.name == invocationDef.operation);
                                    this.selectOperation(operationToSelect);
                                    //restore the arguments in the parameters struct
                                    for (let argName in invocationDef.arguments) {
                                        let paramStruct = this.parameters.find(p => p.param.name == argName);
                                        if (paramStruct != null) {
                                            paramStruct.value = invocationDef.arguments[argName];
                                        }
                                    }
                                }
                            );
                        }
                   );
                }
            }
        );
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
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
        let argsMap: { [key: string]: string } = {};
        this.parameters.forEach(p => argsMap[p.param.name] = p.value);

        let serviceInvocationDef: ServiceInvocationDefinition = {
            label: this.label,
            description: this.description,
            template: this.template,
            service: this.selectedService.name,
            operation: this.selectedOperation.name,
            arguments: argsMap,
        }
        if (this.dialog.context.serviceInvocation == null) { //create
            this.invokableReporterService.addSectionToReporter(this.context.invokableReporterRef.relativeReference, serviceInvocationDef).subscribe(
                () => {
                    this.dialog.close();
                }
            )
        } else { //edit
            this.invokableReporterService.updateSectionInReporter(this.context.invokableReporterRef.relativeReference, serviceInvocationDef, 
                this.context.serviceInvocation.idx).subscribe(
                () => {
                    this.dialog.close();
                }
            )
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}

interface EditableParamStruct {
    param: OperationParameter;
    show: string;
    value: string;
}