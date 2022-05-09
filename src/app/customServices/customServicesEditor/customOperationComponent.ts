import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { CustomOperationDefinition, CustomOperationTypes, TypeUtils } from "../../models/CustomService";
import { YasguiComponent } from "../../sparql/yasguiComponent";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { CustomServiceModalServices } from "./modals/customServiceModalServices";

@Component({
    selector: "custom-operation",
    templateUrl: "./customOperationComponent.html",
    host: { class: "vbox" },
    styleUrls: ["../customServices.css"]
})
export class CustomOperationComponent {
    @Input() operation: CustomOperationDefinition;
    @Input() readonly: boolean;
    @Output() update: EventEmitter<void> = new EventEmitter(); //tells to the parent that the service has been modified
    @ViewChild(YasguiComponent, { static: false }) viewChildYasgui: YasguiComponent;

    isSparql: boolean;
    parameters: { prettyPrint: string, required: boolean }[] = [];
    returns: string;

    private editOperationAuthorized: boolean;

    constructor(private customServiceModals: CustomServiceModalServices) { }

    ngOnInit() {
        this.editOperationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.customServiceOperationUpdate);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['operation'].currentValue) {
            this.returns = TypeUtils.serializeType(this.operation.returns);
            if (this.operation.parameters != null) {
                this.parameters = this.operation.parameters.map(p => {
                    return { prettyPrint: TypeUtils.serializeParameter(p), required: p.required };
                });
            }

            this.isSparql = this.operation["@type"] == CustomOperationTypes.SparqlOperation;
            if (this.isSparql) {
                setTimeout(() => { //give time to init yasgui component
                    this.viewChildYasgui.forceContentUpdate();
                });
            }

        }
    }

    private editOperation() {
        this.customServiceModals.openCustomOperationEditor({ key: "CUSTOM_SERVICES.ACTIONS.EDIT_CUSTOM_OPERATION" }, this.operation.serviceId, this.operation).then(
            () => {
                this.update.emit();
            },
            () => { }
        );
    }

}