import { Component, ElementRef, EventEmitter, HostListener, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ARTNode, ARTResource } from '../../models/ARTResources';
import { ResourceUtils } from '../../utils/ResourceUtils';
import { BasicModalServices } from '../modal/basicModal/basicModalServices';
import { ModalType } from '../modal/Modals';

@Component({
    selector: 'inline-editable-value',
    templateUrl: './inlineEditableValue.html',
    styleUrls: ["./inlineEditableValue.css"],
    host: { class: "d-block" }
})
export class InlineEditableValue {
    @Input() value: ARTNode;
    @Input() disabled: boolean = false;
    @Input() preventEdit: boolean = false; //useful when the edit is handled from outside (e.g. creation of CF value) but the input field should not be disabled
    @Input() focusOnInit: boolean = false;
    @Input() textStyle: string;
    @Output() edited = new EventEmitter<string>();
    @Output() editCanceled = new EventEmitter<void>();

    @ViewChild('editBlock') textarea: ElementRef;
    
    textareaRows: number;

    editInProgress: boolean = false;
    stringValue: string;
    pristineStringValue: string;

    ngClassValue: InlineEditableCssClass = {};

    constructor(private basicModals: BasicModalServices) {}

    ngOnInit() {
        this.initValue();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['value'] && changes['value'].currentValue) {
            this.initValue();
            this.initRenderingClassStatus();
        }
    }

    initValue() {
        this.stringValue = (this.value != null) ? this.value.getShow() : null;
        this.pristineStringValue = this.stringValue;
    }

    /**
     * Initializes the class of the resource text: green if the resource is in the staging-add-graph, red if it's in the staging-remove-graph
     */
    initRenderingClassStatus() {
        //reset all statuses
        this.ngClassValue = {
            proposedAddRes: false,
            proposedAddTriple: false,
            proposedRemoveRes: false,
            proposedRemoveTriple: false
        };
        //init statuses
        if (this.value instanceof ARTResource) {
            if (ResourceUtils.isResourceInStagingAdd(this.value)) {
                this.ngClassValue.proposedAddRes = true;
            } else if (ResourceUtils.isResourceInStagingRemove(this.value)) {
                this.ngClassValue.proposedRemoveRes = true;
            }
        }
        if (ResourceUtils.isTripleInStagingAdd(this.value)) {
            this.ngClassValue.proposedAddTriple = true;
        } else if (ResourceUtils.isTripleInStagingRemove(this.value)) {
            this.ngClassValue.proposedRemoveTriple = true;
        }

        if (
            this.ngClassValue.proposedAddRes || this.ngClassValue.proposedAddTriple || 
            this.ngClassValue.proposedRemoveRes || this.ngClassValue.proposedRemoveTriple
        ) {
            this.disabled = true;
        }
    }

    private edit() {
        this.focusOnInit = false; //now that component has been initialized, focusOnInit is no more useful, so reset it in order to do not alter onDocumentClick()
        
        if (this.disabled || this.preventEdit) return;

        if (this.value != null) {
            //update the rows attribute of the textarea (so when it is editing the textarea will have the same size of the element in non-editing mode)
            let lineBreakCount = (this.stringValue.match(/\n/g) || []).length;
            this.textareaRows = lineBreakCount + 1;
        } else {
            this.textareaRows = 1;
        }
        this.editInProgress = true;
        setTimeout(() => { //wait to initialize the textarea
            //set the cursor at the end of the content
            (<HTMLTextAreaElement>this.textarea.nativeElement).focus();
        });
    }

    onKeydown(event: KeyboardEvent) {
        if (event.key == "Escape") {
            this.cancelEdit();
        } else if (event.key == "Enter") {
            if (event.shiftKey || event.altKey || event.ctrlKey) { //newline
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
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_OR_EMPTY_VALUE" }, ModalType.warning);
                this.stringValue = this.pristineStringValue;
                return;
            }
            this.pristineStringValue = this.stringValue;
            this.edited.emit(this.stringValue);
        }
    }

    private cancelEdit() {
        this.editInProgress = false;
        this.stringValue = this.pristineStringValue; //restore initial value
        this.editCanceled.emit();
    }


    /**
     * Click inside/outside handlers.
     * Explanation:
     * onComponentClick is triggered only when the click is detected on the current component
     * onDocumentClick is triggered at every click on document (both in and outside component)
     * In case the component is clicked, the two handler are executed in the following order:
     * 1: onComponentClick, 2: onDocumentClick
     * The first handler tells that the click is done inside (clickInside),
     * the second check clickInside and decide how to handle the event: inside start to edit, outside cancel edit
     */

    private clickInside: boolean = false;
    @HostListener("click")
    onComponentClick() {
        if (this.disabled || this.preventEdit) return;
        this.clickInside = true;
    }
    @HostListener("document:click")
    onDocumentClick() {
        if (this.disabled || this.preventEdit) return;
        /* 
        Edit: 
        - if flagged as click inside
        - if focusOnInit is true: this component has been likely initialized with a click on a button, so prevent to detected click as outside and cancel edit
        */
        if (this.clickInside || this.focusOnInit) {
            if (!this.editInProgress) { //only if not already editing
                this.edit();
            }
        } else {
            this.cancelEdit();
        }
        this.clickInside = false;
    }

}

interface InlineEditableCssClass {
    proposedAddRes?: boolean;
    proposedRemoveRes?: boolean;
    proposedAddTriple?: boolean;
    proposedRemoveTriple?: boolean;
}