import { Component, forwardRef, Input, SimpleChanges } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ARTNode, ARTURIResource } from "src/app/models/ARTResources";
import { WizardGraphEntry, WizardNode, WizardNodeEntryPoint } from "./CustomFormWizard";

@Component({
    selector: "custom-form-wizard-graph-editor",
    templateUrl: "./customFormWizardGraphEditor.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomFormWizardGraphEditor), multi: true,
    }],
    host: { class: "vbox" }
})
export class CustomFormWizardGraphEditor implements ControlValueAccessor {
    @Input() nodes: WizardNode[];
    
    graphs: WizardGraphEntry[];

    private entryPoint: WizardNodeEntryPoint;

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['nodes'] && changes['nodes'].currentValue != null) {
            this.entryPoint = this.nodes.find(n => n instanceof WizardNodeEntryPoint);
        }
    }

    addGraph() {
        let g: WizardGraphEntry = new WizardGraphEntry(this.entryPoint);
        this.graphs.push(g);
        this.onModelChange();
    }

    removeGraph(graph: WizardGraphEntry) {
        this.graphs.splice(this.graphs.indexOf(graph), 1);
        this.onModelChange();
    }

    onGraphPredicateChange(graph: WizardGraphEntry, predicate: ARTURIResource) {
        graph.predicate = predicate;
        this.onModelChange();
    }

    onGraphObjectValueChange(graph: WizardGraphEntry, value: ARTNode) {
        graph.object.value = value;
        this.onModelChange();
    }

    onModelChange() {
        this.propagateChange(this.graphs);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
     writeValue(obj: WizardGraphEntry[]) {
        if (obj) {
            this.graphs = obj;
        } else {
            this.graphs = [];
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