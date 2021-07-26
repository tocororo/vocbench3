import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { ARTURIResource } from "src/app/models/ARTResources";
import { ServicesServices } from "src/app/services/servicesServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { Reference } from "../../../models/Configuration";
import { CustomOperationDefinition, CustomService, CustomServiceDefinition, Operation, OperationParameter, TypeUtils } from "../../../models/CustomService";
import { ServiceInvocationDefinition } from "../../../models/InvokableReporter";
import { CustomServiceServices } from "../../../services/customServiceServices";
import { InvokableReportersServices } from "../../../services/invokableReportersServices";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CustomServiceModalServices } from "../../customServicesEditor/modals/customServiceModalServices";

@Component({
    selector: "service-invocation-editor-modal",
    templateUrl: "./serviceInvocationEditorModal.html",
    styleUrls: ["../../customServices.css"],
})
export class ServiceInvocationEditorModal {
    @Input() title: string;
    @Input() invokableReporterRef: Reference;
    @Input() serviceInvocation: { def: ServiceInvocationDefinition, idx: number }

    label: string;
    description: string;
    template: string;

    readonly CUSTOM_SERVICE_PATH: string = "it.uniroma2.art.semanticturkey/st-custom-services";
    extPaths: IdShowPair[];
    selectedExtPath: string;

    pathServiceMap: { [key: string]: IdShowPair[] } = {}; //cache extPath => list of service classes

    selectedServiceId: string; //ID of the selected service class
    private selectedService: CustomServiceDefinition; //caches the custom service selected (contains the operations with their description, useful when a custom operation ID is selected)
    operations: IdShowPair[]; //list of operations (id + show) of the selected service class (independently if it is custom or not)
    selectedOperationId: string;
    selectedOperation: CustomOperationDefinition; //operation with the ID = selectedOperationId (retrieved via service for core-services, from selectedService for custom-services)
    parameters: EditableParamStruct[]; //parameters of the selected operation (list of editable parameter structures)

    constructor(private customServService: CustomServiceServices, private servicesService: ServicesServices, private invokableReporterService: InvokableReportersServices,
        private basicModals: BasicModalServices, private customServiceModals: CustomServiceModalServices,
        public activeModal: NgbActiveModal, private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.servicesService.getExtensionPaths().subscribe(
            extPaths => {
                extPaths.unshift(this.CUSTOM_SERVICE_PATH);
                this.extPaths = extPaths.map(p => {
                    return { show: p.substring(p.lastIndexOf("/") + 1), id: p };
                });
                if (this.serviceInvocation != null) {
                    let invocationDef: ServiceInvocationDefinition = this.serviceInvocation.def;
                    this.label = invocationDef.label;
                    this.description = invocationDef.description;
                    this.template = invocationDef.template;
                    /* Restore:
                    - ext path
                    - selected service
                    - selected operation
                    - operation parameters with values
                    */
                    if (invocationDef.extensionPath == null || invocationDef.extensionPath == this.CUSTOM_SERVICE_PATH) { //null check for retro-compatibility
                        this.selectedExtPath = this.CUSTOM_SERVICE_PATH;
                        this.initServiceList().subscribe(
                            () => {
                                this.customServService.getCustomServiceId(invocationDef.service).subscribe(
                                    serviceId => {
                                        this.selectService(serviceId).subscribe(
                                            () => {
                                                this.restoreOperationAndParams(invocationDef);
                                            }
                                        )
                                    }
                                );
                            }
                        );
                    } else { //restore a service invocation of a non-custom service
                        this.selectedExtPath = invocationDef.extensionPath;
                        this.initServiceList().subscribe(
                            () => {
                                this.selectService(invocationDef.service).subscribe(
                                    () => {
                                        this.restoreOperationAndParams(invocationDef);
                                    }
                                )
                            }
                        );
                    }

                } else {
                    this.selectedExtPath = this.CUSTOM_SERVICE_PATH; //default selectionb
                    this.initServiceList().subscribe();
                }
            }
        )
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    /**
     * Restore the selected operation and its parameters
     * @param invocationDef 
     */
     private restoreOperationAndParams(invocationDef: ServiceInvocationDefinition) {
        //in the service invocation it is stored the operation name (eg. countTopConcepts) 
        //for the "standard" services, getServiceOperations returns the operation IRI 
        //(e.g. http://semanticturkey.uniroma2.it/services/it.uniroma2.art.semanticturkey/st-core-services/SKOS/countTopConcepts)
        //I need to handle this disalignment
        let operationIdToRestore: string = invocationDef.operation;
        if (invocationDef.extensionPath != null && invocationDef.extensionPath != this.CUSTOM_SERVICE_PATH) {
            operationIdToRestore = this.operations.find(o => o.id.endsWith(invocationDef.service + "/" + invocationDef.operation)).id;
        } 
        this.selectOperation(operationIdToRestore).subscribe(
            () => {
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

    /**
     * init the services list for the current selected extension path 
     * (this is async since, in case of editing an existing service invocation, I need to wait for the initialization
     * of the service classes and operations in order to restore the whole UI)
     */
    initServiceList(): Observable<void> {
        this.selectedServiceId = null;
        this.selectedService = null;
        this.operations = null;
        this.selectedOperation = null;
        this.selectedOperationId = null;
        this.parameters = null;

        if (this.pathServiceMap[this.selectedExtPath] == null) {
            //service classes are retrieved through getCustomServiceIdentifiers (for custom service) or getServiceClasses (for other paths)
            let getServiceClassFn: Observable<string[]>;
            if (this.selectedExtPath == this.CUSTOM_SERVICE_PATH) {
                getServiceClassFn = this.customServService.getCustomServiceIdentifiers();
            } else {
                getServiceClassFn = this.servicesService.getServiceClasses(this.selectedExtPath);
            }
            return getServiceClassFn.pipe(
                map(classes => {
                    this.pathServiceMap[this.selectedExtPath] = classes.map(c => { return { id: c, show: c.substring(c.lastIndexOf(".") + 1) } });
                })
            )
        } else {
            return of(null);
        }
    }

    /**
     * (this is asyn, read initServiceList comment for details)
     * @param serviceId 
     * @returns 
     */
    selectService(serviceId: string): Observable<void> {
        if (this.selectedServiceId == serviceId) {
            return of(null);
        } else {
            this.selectedServiceId = serviceId;
            return this.initService(serviceId);
        }
    }

    /**
     * Init the selected service description and the list of its operations
     * @param serviceId 
     * @returns 
     */
    initService(serviceId: string): Observable<void> {
        this.operations = null;
        this.selectedOperation = null;
        this.selectedOperationId = null;
        this.parameters = null;

        if (this.selectedExtPath == this.CUSTOM_SERVICE_PATH) {
            return this.customServService.getCustomService(serviceId).pipe(
                map((conf: CustomService) => {
                    this.selectedService = {
                        name: conf.getPropertyValue("name"),
                        description: conf.getPropertyValue("description"),
                        operations: conf.getPropertyValue("operations")
                    };
                    this.operations = this.selectedService.operations.map(o => { return { id: o.name, show: o.name } });
                })
            )
        } else {
            return this.servicesService.getServiceOperations(this.selectedExtPath, serviceId).pipe(
                map(operations => {
                    this.operations = operations.map(o => { return { id: o, show: o.substring(o.lastIndexOf("/") + 1) } });
                })
            );
        }
    }

    selectOperation(operationId: string): Observable<void> {
        if (this.selectedOperationId == operationId) {
            return of(null);
        } else {
            this.selectedOperationId = operationId;
            if (this.selectedExtPath == this.CUSTOM_SERVICE_PATH) {
                this.selectedOperation = this.selectedService.operations.find(o => o.name == operationId);
                this.initParameters();
                return of(null);
            } else {
                this.servicesService.getServiceOperation(new ARTURIResource(operationId)).subscribe();
                return this.servicesService.getServiceOperationAsCustomService(new ARTURIResource(operationId)).pipe(
                    map((operation: Operation) => {
                        this.selectedOperation = {
                            "@type": operation.type,
                            name: operation.getPropertyValue("name"),
                            returns: operation.getPropertyValue("returns"),
                            authorization: operation.getPropertyValue("authorization"),
                            parameters: operation.getPropertyValue("parameters"),
                            serviceId: this.selectedServiceId
                        };
                        this.initParameters();
                    })
                )
            }
        }
    }

    private initParameters() {
        this.parameters = [];
        if (this.selectedOperation.parameters != null) {
            this.selectedOperation.parameters.forEach(p => {
                this.parameters.push({ param: p, show: TypeUtils.serializeParameter(p), value: null });
            })
        }
    }


    describeSelectedOperation() {
        //open a read-only modal for custom operation
        this.customServiceModals.openCustomOperationView(this.selectedOperation);
    }


    isDataValid(): boolean {
        if (this.selectedOperation != null) { //operation selected => check if it has parameters and in case if they are set
            if (this.selectedOperation.returns && this.selectedOperation.returns.name == TypeUtils.Types.void) {
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
                if (p.param.required && (p.value == null || p.value.trim() == "")) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.MISSING_REQUIRED_PARAM", params: { param: p.param.name } }, ModalType.warning);
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
            extensionPath: this.selectedExtPath,
            service: this.selectedServiceId,
            // operation: this.selectedOperation.name, //TODO restore this line in place of the following when the suffix Published will be removed from getServiceOperationAsCustomService response
            operation: this.selectedOperation.name.endsWith("Published") ? this.selectedOperation.name.substring(0, this.selectedOperation.name.length-9) : this.selectedOperation.name,
            arguments: argsMap,
        }
        if (this.serviceInvocation == null) { //create
            this.invokableReporterService.addSectionToReporter(this.invokableReporterRef.relativeReference, serviceInvocationDef).subscribe(
                () => {
                    this.activeModal.close();
                }
            )
        } else { //edit
            this.invokableReporterService.updateSectionInReporter(this.invokableReporterRef.relativeReference, serviceInvocationDef,
                this.serviceInvocation.idx).subscribe(
                    () => {
                        this.activeModal.close();
                    }
                )
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

interface EditableParamStruct {
    param: OperationParameter;
    show: string;
    value: string;
}

interface IdShowPair {
    id: string;
    show: string;
}