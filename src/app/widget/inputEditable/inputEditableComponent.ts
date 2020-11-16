import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { UserForm } from "../../models/User";
import { BasicModalServices } from "../modal/basicModal/basicModalServices";
import { ModalType } from '../modal/Modals';

@Component({
    selector: 'input-editable',
    templateUrl: './inputEditableComponent.html'
})
export class InputEditableComponent implements OnInit {
    @Input() value: any;
    @Input() size: string; //xs, sm, md (default), lg
    @Input() type: string; //text (default), email, date, number, select
    @Input() options: string[]; //options of select element. Used only if type = "select"
    @Input() min: number; //Useful only if type = "number"
    @Input() max: number; //Useful only if type = "number"
    @Input() step: number; //Useful only if type = "number"
    @Input() allowEmpty: boolean = false; //if true allow the value to be replaced with empty string
    @Input() disabled: boolean = false;

    @Output() valueEdited = new EventEmitter<any>();

    inputClass = "input-group";
    private inputType = "text";
    editInProgress: boolean = false;
    private pristineValue: any; //original input value, as backup

    constructor(private basicModals: BasicModalServices) { }

    ngOnInit() {
        //init class of input field
        if (this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.inputClass += " input-group-" + this.size;
        }
        //init type of input field
        if (this.type == "email" || this.type == "date" || this.type == "number") {
            this.inputType = this.type;
        }

        this.pristineValue = this.value;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['value'] && changes['value'].currentValue) {
            this.pristineValue = this.value;
        }
    }

    private edit() {
        this.editInProgress = true;
    }

    private confirmEdit() {
        if (this.value == undefined || this.value.trim() == "") {
            if (this.allowEmpty) {
                this.value = null;
            } else {
                this.basicModals.alert("Invalid value", "The inserted value is empty or not valid. Please check and retry.", ModalType.warning);
                return;
            }
        } else if (this.type == "email" && !UserForm.isValidEmail(this.value)) {
            this.basicModals.alert("Invalid value", "The inserted value is not valid. Please check and retry.", ModalType.warning);
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