import { Component, Input, SimpleChanges, ViewChild } from "@angular/core";
import { CustomOperationDefinition, CustomOperationTypes, OperationParameter, TypeUtils } from "../models/CustomService";
import { YasguiComponent } from "../sparql/yasguiComponent";

@Component({
    selector: "custom-operation",
    templateUrl: "./customOperationComponent.html",
    host: { class: "vbox" },
    styleUrls: ["./customServices.css"]
})
export class CustomOperationComponent {

    @Input() operation: CustomOperationDefinition;
    @ViewChild(YasguiComponent) viewChildYasgui: YasguiComponent;

    private isSparql: boolean;
    private parameters: { prettyPrint: string, required: boolean }[];
    private returns: string;

    constructor() {}
    
    ngOnChanges(changes: SimpleChanges) {
        if (changes['operation'].currentValue) {
            this.returns = TypeUtils.serializeType(this.operation.returns);
            this.parameters = this.operation.parameters.map(p => {
                return { prettyPrint: TypeUtils.serializeParameter(p), required: p.required }
            });

            this.isSparql = this.operation["@type"] == CustomOperationTypes.SparqlOperation;
            if (this.isSparql) {
                setTimeout(() => { //give time to init yasgui component
                    this.viewChildYasgui.forceContentUpdate();
                })
            }
            
        }
    }

}