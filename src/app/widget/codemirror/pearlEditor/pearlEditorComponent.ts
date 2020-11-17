import { Component, forwardRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import * as CodeMirror from 'codemirror';

@Component({
    selector: 'pearl-editor',
    templateUrl: "pearlEditorComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PearlEditorComponent), multi: true,
    }],
    host: { class: "vbox" }
})
export class PearlEditorComponent implements ControlValueAccessor {
    @Input() disabled: boolean;

    @ViewChild('cmEditor') private cmEditorView: CodemirrorComponent;
    
    private cmEditor: CodeMirror.EditorFromTextArea;

    code: string;
    editorConfig: CodeMirror.EditorConfiguration;

    constructor() { }

    ngOnInit() {
        this.editorConfig = {
            lineNumbers: true,
            mode: "pearl",
            indentUnit: 4,
            indentWithTabs: true,
            lineWrapping: true,
            readOnly: this.disabled,
            viewportMargin: Infinity,//with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
                //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
            extraKeys: {
                "Ctrl-7": () => this.commentHandler(this.cmEditor)
            },
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
     * Cannot declare cm as CodeMirror.FromTextEditor since typings has not toggleComment definition
     * (it is not included in codemirror.js, it is in comment.js)
     */
    private commentHandler(cm: any) {
        var start = cm.cursorCoords(true, "local");
        var end = cm.cursorCoords(false, "local");
        cm.toggleComment({ from: start, to: end });
    }

    /**
     * Insert the given text in the position where the cursor is
     * (useful when in Sheet2RDF or in the CustomForm editor, a converter is added from the selector)
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