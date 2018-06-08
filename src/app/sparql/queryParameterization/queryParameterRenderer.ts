import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder, Modal } from "ngx-modialog/plugins/bootstrap";
import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum, ResourceUtils } from "../../models/ARTResources";
import { BindingTypeEnum, VariableBindings } from "../../models/Sparql";
import { QueryParameterizerModal, QueryParameterizerModalData } from "./queryParameterizerModal";

@Component({
    selector: "query-param-renderer",
    templateUrl: "./queryParameterRenderer.html"
})
export class QueryParameterRenderer {

    @Input() bindings: VariableBindings;
    @Output() update = new EventEmitter<Map<string, ARTNode>>();
    @Output() paramsChange = new EventEmitter<VariableBindings>(); //when parametrization changes, useful to the parent in order to detect unsaved parametrizations

    private bindingStructs: BindingStruct[];
    private useBindings: boolean = true;

    constructor(private modal: Modal) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['bindings'] && changes['bindings'].currentValue) {
            this.initBindingStruct();
        }
    }

    /**
     * Adapt VariableBindings in a model (BindingStruct[]) more suitable for the UI
     */
    private initBindingStruct() {
        this.bindingStructs = [];
        setTimeout(() => { //let destroy the view, so that in case it is changed just the var names, the table is rebuilt with no UI problem
            for (var varName in this.bindings) {
                let bs: BindingStruct = {
                    varName: varName,
                    bindingType: this.bindings[varName].bindingType
                }
                if (this.bindings[varName].bindingType == BindingTypeEnum.assignment) {
                    bs.value = ResourceUtils.parseNode(this.bindings[varName].value);
                } else if (this.bindings[varName].bindingType == BindingTypeEnum.constraint) {
                    if (this.bindings[varName].datatype != null) {
                        bs.datatype = ResourceUtils.parseURI(this.bindings[varName].datatype);
                    } else if (this.bindings[varName].resourceRole != null) {
                        bs.resourceRole = this.bindings[varName].resourceRole;
                    }
                }
                this.bindingStructs.push(bs);
            }
            this.emitUpdate();
        });
    }

    private onResourceChanged(binding: BindingStruct, value: ARTURIResource) {
        binding.value = value;
        this.emitUpdate();
    }

    private onLiteralChanged(binding: BindingStruct, value: ARTLiteral) {
        binding.value = value;
        this.emitUpdate();
    }

    private editParameterization() {
        var modalData = new QueryParameterizerModalData(this.bindings);
        const builder = new BSModalContextBuilder<QueryParameterizerModalData>(
            modalData, undefined, QueryParameterizerModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('lg').toJSON() };
        this.modal.open(QueryParameterizerModal, overlayConfig).result.then(
            (updatedVarBindings: VariableBindings) => {
                this.bindings = updatedVarBindings;
                // this.initBindingStruct();
                this.paramsChange.emit(this.bindings);
            },
            () => {}
        );
    }

    /**
     * When variable bnindings changed
     */
    private emitUpdate() {
        let bindingsMap: Map<string, ARTNode> = new Map();
        if (this.useBindings) {
            this.bindingStructs.forEach(bs => {
                bindingsMap.set(bs.varName, bs.value);
            });
        }
        this.update.emit(bindingsMap);
    }

}

class BindingStruct {
    varName: string;
    bindingType: BindingTypeEnum;
    resourceRole?: RDFResourceRolesEnum; //if type is constraint
    datatype?: ARTURIResource; //if type is constraint
    value?: ARTNode; //if type is assignment
}