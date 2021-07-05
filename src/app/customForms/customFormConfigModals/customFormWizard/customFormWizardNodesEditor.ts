import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { SKOS, SKOSXL } from "src/app/models/Vocabulary";
import { RangeType } from "src/app/services/propertyServices";
import { VBContext } from "src/app/utils/VBContext";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { ModalOptions } from "src/app/widget/modal/Modals";
import { ConverterConfigModal } from "./converterConfigModal";
import { SessionFeature, StandardFormFeature, WizardField, WizardNode, WizardNodeEntryPoint, WizardNodeUserCreated } from "./CustomFormWizard";

@Component({
    selector: "custom-form-wizard-nodes-editor",
    templateUrl: "./customFormWizardNodesEditor.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomFormWizardNodesEditor), multi: true,
    }],
    host: { class: "vbox" }
})
export class CustomFormWizardNodesEditor implements ControlValueAccessor {
    @Input() fields: WizardField[]; //for the selection of the converter feature
    @Input() customRange: boolean; //tells if the wizard works for CustomRange (false if for Constructor)

    sessionFeatures: SessionFeature[];
    stdFormFeatures: StandardFormFeature[];

    nodes: WizardNode[];

    constructor(private modalService: NgbModal) { }

    ngOnInit() {
        this.sessionFeatures = [SessionFeature.user]; //available for both C.Range and C.Constructor

        //for custom constructor add the feature of stdForm
        if (!this.customRange) {
            this.stdFormFeatures = [StandardFormFeature.resource];
            let lexModel: string = VBContext.getWorkingProject().getLexicalizationModelType();
            if (lexModel == SKOS.uri) {
                this.stdFormFeatures.push(StandardFormFeature.labelLang);
                this.stdFormFeatures.push(StandardFormFeature.label);
            } else if (lexModel == SKOSXL.uri) {
                this.stdFormFeatures.push(StandardFormFeature.labelLang);
                this.stdFormFeatures.push(StandardFormFeature.xlabel);
                this.stdFormFeatures.push(StandardFormFeature.lexicalForm);
            }
            this.stdFormFeatures.sort((f1, f2) => f1.featureName.localeCompare(f2.featureName));
        }
    }

    addNode() {
        let nodeId = "new_node";
        let i = 1;
        while (this.nodes.some(n => n.nodeId == nodeId)) {
            nodeId = "new_node" + i;
            i++;
        }
        this.nodes.push(new WizardNodeUserCreated(nodeId));
        this.onModelChange();
    }

    removeNode(node: WizardNode) {
        this.nodes.splice(this.nodes.indexOf(node), 1);
        this.onModelChange();
    }

    editNodeConverter(node: WizardNode) {
        const modalRef: NgbModalRef = this.modalService.open(ConverterConfigModal, new ModalOptions('xl'));
        modalRef.componentInstance.converter = node.converterStatus != null ? node.converterStatus.converter : null;
        modalRef.componentInstance.rangeType = (node instanceof WizardNodeEntryPoint) ? RangeType.resource : null; //in case of entry point, restrict the converter to those producing URI
        modalRef.result.then(
            (data: ConverterConfigStatus) => {
                node.converterStatus = data;
                node.updateConverterSerialization(VBContext.getPrefixMappings());
                this.onModelChange();
            },
            () => { }
        );
    }

    onModelChange() {
        this.propagateChange(this.nodes);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
     writeValue(obj: WizardNode[]) {
        if (obj) {
            this.nodes = obj;
        } else {
            this.nodes = [];
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };


}