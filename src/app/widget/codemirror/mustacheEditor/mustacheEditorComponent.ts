import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as CodeMirror from 'codemirror';
// import './mustache';

@Component({
    selector: 'mustache-editor',
    templateUrl: "mustacheEditorComponent.html",
    providers: [{
         provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MustacheEditorComponent), multi: true,
    }],
    host: { class: "vbox" }
})

export class MustacheEditorComponent implements ControlValueAccessor {
    @Input() disabled: boolean;
    
    @ViewChild('txtarea', { static: true }) textareaElement: any;

    private cmEditor: CodeMirror.EditorFromTextArea;

    constructor() { }

    ngAfterViewInit() {
        this.cmEditor = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            { 
                lineNumbers: true,
                mode: "mustache",
                lineWrapping: true,
                readOnly: this.disabled,
                viewportMargin: Infinity,//with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
                    //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
            }
        );
        console.log("mode", this.cmEditor.getMode())

        this.cmEditor.on('change', (cm: CodeMirror.Editor) => {
            this.propagateChange(cm.getDoc().getValue());
        });

    }

    /**
     * Insert the given text in the position where the cursor is.
     * @param text
     */
    insertAtCursor(text: string) {
        let cursor = this.cmEditor.getDoc().getCursor();
        this.cmEditor.getDoc().replaceRange(text, cursor, cursor);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        if (this.cmEditor) { //prevent error if editor is not yet initialized
            if (obj != null) {
                this.cmEditor.setValue(obj);
            } else {
                this.cmEditor.setValue("");
            }
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