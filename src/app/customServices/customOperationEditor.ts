import { Component, Input, SimpleChanges, ViewChild } from "@angular/core";
import { CustomOperation, SPARQLOperation, OperationType, OperationParameter } from "../models/CustomService";
import { YasguiComponent } from "../sparql/yasguiComponent";

@Component({
    selector: "custom-operation",
    templateUrl: "./customOperationEditor.html",
    host: { class: "vbox" },
    styles: [`
        .entryRow { 
            margin-bottom: 8px;
        }
        .entryLabel {
            text-align: right;
            padding: 6px 8px 0px;
            min-width: 90px;
            width: 90px;
        }
    `]
})
export class CustomOperationEditor {

    @Input() operation: CustomOperation;

    @ViewChild(YasguiComponent) viewChildYasgui: YasguiComponent;

    private isSparql: boolean;
    private parameters: { prettyPrint: string, required: boolean }[];
    private returns: string;

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['operation'].currentValue) {
            this.returns = this.getTypePrettyPrint(this.operation.returns);
            this.parameters = [];
            this.operation.parameters.forEach(p => {
                this.parameters.push({
                    prettyPrint: this.getParameterPrettyPrint(p),
                    required: p.required
                })
            });
            console.log("parameters", this.parameters);

            this.isSparql = this.operation instanceof SPARQLOperation || this.operation.hasOwnProperty("sparql");
            setTimeout(() => { //give time to init yasgui component
                this.viewChildYasgui.forceContentUpdate();
            })
        }
    }

    private getParameterPrettyPrint(opParam: OperationParameter): string {
        let paramPrettyPrint: string;
        paramPrettyPrint = this.getTypePrettyPrint(opParam.type);
        paramPrettyPrint += " " + opParam.name;
        return paramPrettyPrint;
    }

    private getTypePrettyPrint(opType: OperationType): string {
        let typePrettyPrint: string;
        typePrettyPrint = opType.name;
        if (typePrettyPrint.indexOf(".") > 0) { //prevent cases like: "java.lang.String"
            typePrettyPrint = typePrettyPrint.substr(typePrettyPrint.lastIndexOf(".")+1);
        }
        if (opType.name == "AnnotatedValue" || opType.name == "List") {
            if (opType.typeArguments != null) {
                let argsPrettyPrints = opType.typeArguments.map(arg => this.getTypePrettyPrint(arg));
                typePrettyPrint += "<" + argsPrettyPrints.join(",") + ">";
            }
        }
        return typePrettyPrint;
    }

}