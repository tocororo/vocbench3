import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'datetime-picker',
    templateUrl: './datetimePickerComponent.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatetimePickerComponent), multi: true,
    }],
})
export class DatetimePickerComponent {

    datetime: Date;

    inFirefox: boolean; //12-7-2021: firefox does not support <input type="datetime-local"> (see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local)
    dateStr: string;
    timeStr: string;

    datetimeStr: string;

    constructor() { }

    ngOnInit() {
        this.inFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        // this.datetime = new Date(); //init with the current date
        // this.initDatetimeStr();
    }

    initDatetimeStr() {
        if (this.inFirefox) {
            this.dateStr = this.getLocalDateStr(); //YYYY-MM-DD
            this.timeStr = this.datetime.toTimeString().slice(0, 5); //mm:ss
        } else {
            this.datetimeStr = this.getLocalDateStr() + "T" + this.datetime.toTimeString().slice(0, 5);
        }
        this.propagateChange(this.datetime);
    }

    private getLocalDateStr(): string {
        return this.datetime.getFullYear().toString() + '-' //yyyy
            + ("0" + (this.datetime.getMonth() + 1)).slice(-2) + '-' //MM
            + ("0" + (this.datetime.getDate())).slice(-2); //dd
    }

    onDatetimePickerChange() {
        this.datetime = new Date(this.datetimeStr);
        this.propagateChange(this.datetime);
    }

    onDatePickerChange() {
        if (this.timeStr != null) {
            this.datetime = new Date(this.dateStr + "T" + this.timeStr);
            this.propagateChange(this.datetime);
        }
    }

    onTimePickerChange() {
        if (this.dateStr != null) {
            this.datetime = new Date(this.dateStr + "T" + this.timeStr);
            this.propagateChange(this.datetime);
        }
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: Date) {
        if (obj) {
            this.datetime = obj;
        } else {
            this.datetime = new Date();
        }
        this.initDatetimeStr();
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