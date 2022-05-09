import { Component, forwardRef, Input, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as CodeMirror from 'codemirror';

@Component({
    selector: 'json-editor',
    templateUrl: "jsonEditorComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JsonEditorComponent), multi: true,
    }],
    host: { class: "vbox" }
})

export class JsonEditorComponent implements ControlValueAccessor {
    @Input() disabled: boolean;
    @Input() lineNumbers: boolean = true;

    editorConfig: CodeMirror.EditorConfiguration;
    code: string;

    constructor() { }

    ngOnInit() {
        this.editorConfig = {
            lineNumbers: this.lineNumbers,
            mode: "application/json",
            lineWrapping: true,
            readOnly: this.disabled,
            // matchBrackets: true,
            // autoCloseBrackets: true,
            viewportMargin: Infinity, //with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
            //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
        };
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['disabled'] && this.editorConfig != null) {
            this.editorConfig.readOnly = this.disabled;
        }
    }

    onCodeChange() {
        this.propagateChange(this.code);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        this.code = obj;
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