import { Component, forwardRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as CodeMirror from 'codemirror';
import { Observable } from 'rxjs';
import { ManchesterServices } from '../../../services/manchesterServices';
import "./manchester";

@Component({
    selector: 'manchester-editor',
    templateUrl: "manchesterEditorComponent.html",
    providers: [{
         provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ManchesterEditorComponent), multi: true,
    }],
    host: { class: "vbox" }
})

export class ManchesterEditorComponent implements ControlValueAccessor {
    @Input() context: ManchesterCtx;
    @Input() disabled: boolean;
    
    @ViewChild('txtarea') textareaElement: any;

    private cmEditor: CodeMirror.EditorFromTextArea;

    private codeValid: boolean = true;
    private codeValidationTimer: number;

    constructor(private manchesterService: ManchesterServices) { }

    ngAfterViewInit() {
        this.cmEditor = CodeMirror.fromTextArea(
            this.textareaElement.nativeElement,
            { 
                lineNumbers: true,
                mode: "manchester",
                indentUnit : 4,
                indentWithTabs: true,
                lineWrapping: true,
                readOnly: this.disabled,
                viewportMargin: Infinity,//with height:auto applied to .CodeMirror class, lets the editor expand its heigth dinamically
                    //moreover, .CodeMirror-scroll { height: 300px; } sets an height limit
            }
        );

        this.cmEditor.on('change', (cm: CodeMirror.Editor) => {
            this.onCodeChange(cm.getDoc().getValue());
        });

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['disabled'] && this.cmEditor != null) {
            this.cmEditor.setOption('readOnly', changes['disabled'].currentValue);
        }
    }

    onCodeChange(code: string) {
        clearTimeout(this.codeValidationTimer);
        this.codeValidationTimer = window.setTimeout(() => { this.validateExpression(code) }, 1000);
        
    }

    validateExpression(code: string) {
        let validationFn: Observable<boolean>;
        if (this.context == ManchesterCtx.datatypeFacets) {
            validationFn = this.manchesterService.checkDatatypeExpression(code);
        } else if (this.context == ManchesterCtx.datatypeEnumeration) {
            validationFn = this.manchesterService.checkLiteralEnumerationExpression(code);
        } else {
            validationFn = this.manchesterService.checkExpression(code);
        }
        validationFn.subscribe(
            valid => {
                this.codeValid = valid;
                if (valid) {
                    this.propagateChange(code);
                } else {
                    this.propagateChange(null); //in case invalid, propagate a null expression
                }
            }
        );
    }

    /**
     * Insert the given text in the position where the cursor is.
     * (this could be useful if it will be added some buttons for adding manchester keyword as AND, OR, ...)
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

/**
 * Useful to distringuish the context in which the editor is used and consequently which validation to apply
 */
export enum ManchesterCtx {
    datatypeFacets = "datatypeFacets", //the manchester expression describes a datatype restriction with facets
    datatypeEnumeration = "datatypeEnumeration", //the manchester expression describes a datatype restriction with enumerations 
    //default case: the manchester expression describes a class axiom
}