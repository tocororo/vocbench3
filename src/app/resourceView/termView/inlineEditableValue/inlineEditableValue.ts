import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ARTNode, ARTResource } from '../../../models/ARTResources';
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { ResourceUtils } from '../../../utils/ResourceUtils';

@Component({
    selector: 'inline-editable-value',
    templateUrl: './inlineEditableValue.html',
    styleUrls: ["./inlineEditableValue.css"]
})
export class InlineEditableValue implements OnInit {
    @Input() value: ARTNode;
    @Input() disabled: boolean = false;
    @Input() preventEdit: boolean = false; //useful when the edit is handled from outside (e.g. creation of CF value) but the input field should not be disabled
    @Input() focusOnInit: boolean = false;
    @Output() valueEdited = new EventEmitter<string>();


    @ViewChild('editBlock') textarea: ElementRef;
    private textareaRows: number;

    private editInProgress: boolean = false;
    private stringValue: string;
    private pristineStringValue: string;

    private renderingClass: string;

    constructor(private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.initValue();
        if (this.focusOnInit) {
            this.edit();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['value'] && changes['value'].currentValue) {
            this.initValue();
            this.initRenderingClass();
        }
    }

    private initValue() {
        this.stringValue = (this.value != null) ? this.value.getShow() : null;
        this.pristineStringValue = this.stringValue;
    }

    /**
	 * Initializes the class of the resource text: green if the resource is in the staging-add-graph, red if it's in the staging-remove-graph
	 */
    private initRenderingClass() {
        this.renderingClass = "";
        if (this.value instanceof ARTResource) {
            if (ResourceUtils.isResourceInStagingAdd(this.value)) {
                this.renderingClass += " proposedAddRes";
            } else if (ResourceUtils.isResourceInStagingRemove(this.value)) {
                this.renderingClass += " proposedRemoveRes";
            }
        }
        if (ResourceUtils.isTripleInStagingAdd(this.value)) {
            this.renderingClass += " proposedAddTriple";
        } else if (ResourceUtils.isTripleInStagingRemove(this.value)) {
            this.renderingClass += " proposedRemoveTriple";
        }
    }

    private edit() {
        if (this.disabled || this.preventEdit) return;

        if (this.value != null) {
            //update the rows attribute of the textarea (so when it is editing the textarea will have the same size of the element in non-editing mode)
            let lineBreakCount = (this.stringValue.match(/\n/g) || []).length;
            this.textareaRows = lineBreakCount + 1;
        } else {
            this.textareaRows = 1;
        }
        this.editInProgress = true;
        setTimeout(() => {  //wait to initialize the textarea
            //set the cursor at the end of the content
            (<HTMLTextAreaElement>this.textarea.nativeElement).focus();
        })
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.key == "Escape") {
            this.cancelEdit();
        } else if (event.key == "Enter") {
            if (event.altKey) { //newline
                let selectionStart: number = (<HTMLTextAreaElement>this.textarea.nativeElement).selectionStart;
                let selectionEnd: number = (<HTMLTextAreaElement>this.textarea.nativeElement).selectionEnd;
                let before = this.stringValue.substring(0, selectionStart);
                let after = this.stringValue.substring(selectionEnd);
                this.stringValue = before + "\n" + after;
                setTimeout(() => { //wait for textarea to update its content
                    (<HTMLTextAreaElement>this.textarea.nativeElement).selectionEnd = selectionStart + 1; //+1 since \n has been added
                });
            } else {
                this.confirmEdit();
            }
        }
    }

    private confirmEdit() {
        this.editInProgress = false;
        if (this.pristineStringValue != this.stringValue) {
            if (this.stringValue == undefined || this.stringValue.trim() == "") {
                this.basicModals.alert("Invalid value", "The inserted value is empty or not valid. Please check and retry.", "warning");
                this.stringValue = this.pristineStringValue;
                return;
            }
            this.pristineStringValue = this.stringValue;
            this.valueEdited.emit(this.stringValue);
        }
    }

    private cancelEdit() {
        this.editInProgress = false;
        this.stringValue = this.pristineStringValue; //restore initial value
    }

}