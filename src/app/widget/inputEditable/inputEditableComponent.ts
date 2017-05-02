import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalServices } from "../modal/basicModal/modalServices";

@Component({
    selector: 'input-editable',
    templateUrl: './inputEditableComponent.html'
})
export class InputEditableComponent implements OnInit {
    @Input() value: string;
    @Input() options: string[]; //options of select element. Used only if type = "select"
    @Input() size: string = "sm"; //xs, sm (default), md, lg
    @Input() type: string; //text (default), email, date, select
    @Input() placeholder: string;

    @Output() valueEdited = new EventEmitter<string>();

    private inputClass = "input-group input-group-";
    private inputType = "text";
    private editInProgress: boolean = false;
    private pristineValue: string; //original input value, as backup

    constructor(private modalService: ModalServices) { }

    ngOnInit() {
        //init class of input field
        if (this.size == "xs" || this.size == "md" || this.size == "lg") {
            this.inputClass += this.size;
        } else {
            this.inputClass += "sm";
        }
        //init type of input field
        if (this.type == "email" || this.type == "date") {
            this.inputType = this.type;
        }

        this.pristineValue = this.value;
    }

    private edit() {
        this.editInProgress = true;
    }

    private confirmEdit() {
        if (this.value != undefined && this.value.trim() != "") {
            this.editInProgress = false;
            this.pristineValue = this.value;
            this.valueEdited.emit(this.value);
        } else {
            this.modalService.alert("Invalid value", "The value inserted is not valid. Please check and retry.", "error");
        }
    }

    private cancelEdit() {
        this.editInProgress = false;
        this.value = this.pristineValue; //restore initial value
    }

}