import { Component, forwardRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as CodeMirror from 'codemirror';
import "./pearl";

@Component({
    selector: 'pearl-editor',
    templateUrl: "pearlEditorComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PearlEditorComponent), multi: true,
    }]
})
export class PearlEditorComponent {
    @Input() disabled: boolean;

    @ViewChild('txtarea') textareaElement: any;

    private cmEditor: CodeMirror.EditorFromTextArea;

    constructor() { }

    ngAfterViewInit() {
        this.cmEditor = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            {
                lineNumbers: true,
                mode: "pearl",
                indentUnit: 4,
                indentWithTabs: true,
                // matchBrackets: true, //it seems not to work
                // autoCloseBrackets: true,
                lineWrapping: true,
                readOnly: this.disabled,
                viewportMargin: Infinity,//with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
                //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
                extraKeys: {
                    "Ctrl-7": () => this.commentHandler(this.cmEditor)
                },
            }
        );

        this.cmEditor.on('change', (cm: CodeMirror.Editor) => {
            //update code in parent component
            this.propagateChange(cm.getDoc().getValue());
        });

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['disabled'] && this.cmEditor != null) {
            this.cmEditor.setOption('readOnly', changes['disabled'].currentValue);
        }
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
        if (obj != null) {
            this.cmEditor.setValue(obj);
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