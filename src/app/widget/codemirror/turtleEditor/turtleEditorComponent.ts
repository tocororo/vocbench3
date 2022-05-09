import { Component, forwardRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import * as CodeMirror from 'codemirror';

@Component({
    selector: 'turtle-editor',
    templateUrl: "turtleEditorComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TurtleEditorComponent), multi: true,
    }],
    host: { class: "vbox" }
})

export class TurtleEditorComponent implements ControlValueAccessor {
    @Input() disabled: boolean;

    @ViewChild('cmEditor') private cmEditorView: CodemirrorComponent;

    cmEditor: CodeMirror.EditorFromTextArea;

    code: string;
    editorConfig: CodeMirror.EditorConfiguration;

    constructor() { }

    ngOnInit() {
        this.editorConfig = {
            lineNumbers: true,
            mode: "text/turtle",
            lineWrapping: true,
            readOnly: this.disabled,
            viewportMargin: Infinity, //with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
            //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
        };
    }

    ngAfterViewInit() {
        this.cmEditor = this.cmEditorView.codeMirror;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['disabled'] && this.editorConfig != null) {
            this.editorConfig.readOnly = this.disabled;
        }
    }

    onCodeChange() {
        this.propagateChange(this.code);
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