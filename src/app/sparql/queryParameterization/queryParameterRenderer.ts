import { Component, Input, SimpleChange, SimpleChanges, Output, EventEmitter } from "@angular/core";
import { VariableBindings, BindingTypeEnum } from "../../models/Sparql";
import { RDFResourceRolesEnum, ARTURIResource, ARTNode, ResourceUtils, ARTLiteral } from "../../models/ARTResources";
import { SearchServices } from "../../services/searchServices";

@Component({
    selector: "query-param-renderer",
    templateUrl: "./queryParameterRenderer.html"
})
export class QueryParameterRenderer {

    @Input() bindings: VariableBindings;
    @Output() update = new EventEmitter<Map<string, ARTNode>>();

    private bindingStructs: BindingStruct[];

    constructor(private searchService: SearchServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['bindings'] && changes['bindings'].currentValue) {
            this.bindingStructs = [];
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
        }
    }

    private onResourceChanged(binding: BindingStruct, value: ARTURIResource) {
        binding.value = value;
        this.emitUpdate();
    }

    private onLiteralChanged(binding: BindingStruct, value: ARTLiteral) {
        binding.value = value;
        this.emitUpdate();
    }

    private emitUpdate() {
        let bindingsMap: Map<string, ARTNode> = new Map();
        this.bindingStructs.forEach(bs => {
            bindingsMap.set(bs.varName, bs.value);
        });
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