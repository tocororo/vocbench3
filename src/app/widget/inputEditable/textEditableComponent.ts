import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BasicModalServices } from "../modal/basicModal/basicModalServices";

@Component({
    selector: 'text-editable',
    templateUrl: './textEditableComponent.html',
    styleUrls: ["./textEditableComponent.css"]
})
export class TextEditableComponent implements OnInit {
    @Input() value: string;
    @Input() allowEmpty: boolean = false; //if true allow the value to be replaced with empty string
    @Input() disabled: boolean = false;
    @Input() focusOnInit: boolean=false;
    @Output() valueEdited = new EventEmitter<string>();
    

    @ViewChild('editBlock') textarea: ElementRef;
    private textareaRows: number;

    private editInProgress: boolean = false;
    private pristineValue: string;

    constructor(private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.pristineValue = this.value;
        if(this.focusOnInit){
            this.edit();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['value'] && changes['value'].currentValue) {
            this.pristineValue = this.value;
        }
    }

    private edit() {
        if (this.disabled) return;
        
        if(this.value != null){
            //update the rows attribute of the textarea (so when it is editing the textarea will have the same size of the element in non-editing mode)
        let lineBreakCount = (this.value.match(/\n/g)||[]).length;
        this.textareaRows = lineBreakCount + 1;
        }else{
            this.textareaRows=1;
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
                let before = this.value.substring(0, selectionStart);
                let after = this.value.substring(selectionEnd);
                this.value = before + "\n" + after;
                setTimeout(() => { //wait for textarea to update its content
                    (<HTMLTextAreaElement>this.textarea.nativeElement).selectionEnd = selectionStart+1; //+1 since \n has been added
                });
            } else {
                this.confirmEdit();
            }
        }
    }

    private confirmEdit() {
        this.editInProgress = false;
        if (this.pristineValue != this.value) {
            if (this.value == undefined || this.value.trim() == "") {
                if (this.allowEmpty) {
                    this.value = null;
                } else {
                    this.basicModals.alert("Invalid value", "The inserted value is empty or not valid. Please check and retry.", "warning");
                    this.value = this.pristineValue;
                    return;
                }
            }
            this.pristineValue = this.value;
            this.valueEdited.emit(this.value);
        }
    }

    private cancelEdit() {
        this.editInProgress = false;
        this.value = this.pristineValue; //restore initial value
    }

}