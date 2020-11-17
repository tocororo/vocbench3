import { Component, forwardRef, Input, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as CodeMirror from 'codemirror';

@Component({
    selector: 'html-editor',
    templateUrl: "htmlEditorComponent.html",
    providers: [{
         provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HtmlEditorComponent), multi: true,
    }],
    host: { class: "vbox" }
})

export class HtmlEditorComponent implements ControlValueAccessor {
    @Input() disabled: boolean;
    
    editorConfig: CodeMirror.EditorConfiguration;
    code: string;

    constructor() { }

    ngOnInit() {
        this.editorConfig = { 
            lineNumbers: true,
            mode: "text/html",
            indentUnit : 4,
            indentWithTabs: true,
            lineWrapping: true,
            readOnly: this.disabled,
            viewportMargin: Infinity,//with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
                //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
        }
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