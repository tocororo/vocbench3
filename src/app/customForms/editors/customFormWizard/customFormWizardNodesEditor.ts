import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { RangeType } from "src/app/services/propertyServices";
import { VBContext } from "src/app/utils/VBContext";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from "src/app/widget/modal/Modals";
import { ConverterConfigModal } from "./converterConfigModal";
import { SessionFeature, StandardFormFeature, WizardAdvGraphEntry, WizardField, WizardNode, WizardNodeResource, WizardNodeUserCreated } from "./CustomFormWizard";

@Component({
    selector: "custom-form-wizard-nodes-editor",
    templateUrl: "./customFormWizardNodesEditor.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomFormWizardNodesEditor), multi: true,
    }],
    host: { class: "vbox" }
})
export class CustomFormWizardNodesEditor implements ControlValueAccessor {
    @Input() customRange: boolean; //tells if the wizard works for CustomRange (false if for Constructor)
    @Input() fields: WizardField[]; //for the selection of the converter feature
    @Input() advGraphs: WizardAdvGraphEntry[]; //useful when deleting a node in order to check if an adv graph refers to the node
    /* The following are useful to inform the wizard that a node has been created/deleted. 
    The nodes variable is already bound to ngModel, so changes are already notified through ngModelChange, 
    but they might be not useful in other scenarios (e.g. deleted is useful for deleting an AdvGraph that is using the deleted node)
    */
    @Output() created: EventEmitter<WizardNode> = new EventEmitter();
    @Output() deleted: EventEmitter<WizardNode> = new EventEmitter();

    sessionFeatures: SessionFeature[];
    stdFormFeatures: StandardFormFeature[];

    nodes: WizardNode[];

    constructor(private modalService: NgbModal, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.sessionFeatures = [SessionFeature.user]; //available for both C.Range and C.Constructor
        this.stdFormFeatures = StandardFormFeature.getStdFeatures(VBContext.getWorkingProject().getModelType(),
            VBContext.getWorkingProject().getLexicalizationModelType(), this.customRange);
    }

    addNode() {
        let nodeId = "new_node";
        let i = 1;
        while (this.nodes.some(n => n.nodeId == nodeId) || this.advGraphs.some(g => g.nodes.some(n => n.nodeId == nodeId))) { //check if there is a node (in nodes list or in the nodes of the advGraphs) with the same name
            nodeId = "new_node" + i;
            i++;
        }
        let newNode = new WizardNodeUserCreated(nodeId);
        this.nodes.push(newNode);
        this.created.emit(newNode);
        this.onModelChange();
    }

    removeNode(node: WizardNode) {
        if (this.advGraphs.some(g => g.nodes.some(n => n == node))) {
            this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.REFERENCED_NODE_DELETE_WARN" }, ModalType.warning).then(
                () => {
                    this.removeImpl(node);
                },
                () => {}
            )
        } else {
            this.removeImpl(node);
        }
    }

    removeImpl(node: WizardNode) {
        this.nodes.splice(this.nodes.indexOf(node), 1);
        this.deleted.emit(node);
        this.onModelChange();
    }

    editNodeConverter(node: WizardNode) {
        const modalRef: NgbModalRef = this.modalService.open(ConverterConfigModal, new ModalOptions('xl'));
        modalRef.componentInstance.converter = node.converterStatus != null ? node.converterStatus.converter : null;
        modalRef.componentInstance.rangeType = (node instanceof WizardNodeResource) ? RangeType.resource : null; //in case of entry point, restrict the converter to those producing URI
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