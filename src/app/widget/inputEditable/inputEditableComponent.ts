import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BasicModalServices } from "../modal/basicModal/basicModalServices";
import { UserForm } from "../../models/User";

@Component({
    selector: 'input-editable',
    templateUrl: './inputEditableComponent.html'
})
export class InputEditableComponent implements OnInit {
    @Input() value: string;
    @Input() options: string[]; //options of select element. Used only if type = "select"
    @Input() size: string = "sm"; //xs, sm (default), md, lg
    @Input() type: string; //text (default), email, date, select
    @Input() allowEmpty: boolean = false; //if true allow the value to be replaced with empty string

    @Output() valueEdited = new EventEmitter<string>();

    private inputClass = "input-group input-group-";
    private inputType = "text";
    private editInProgress: boolean = false;
    private pristineValue: string; //original input value, as backup

    constructor(private basicModals: BasicModalServices) { }

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
        if (((this.value == undefined || this.value.trim() == "") && !this.allowEmpty) || 
            (this.type == "email" && !UserForm.isValidEmail(this.value))) {
            this.basicModals.alert("Invalid value", "The inserted value is empty or not valid. Please check and retry.", "error");
            return;
        }
        this.editInProgress = false;
        this.pristineValue = this.value;
        this.valueEdited.emit(this.value);
    }

    private cancelEdit() {
        this.editInProgress = false;
        this.value = this.pristineValue; //restore initial value
    }

}