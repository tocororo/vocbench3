import { Component, Input, ViewChild, ElementRef, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { VBContext } from "../../../../utils/VBContext";

@Component({
    selector: "editable-ns-input",
    templateUrl: "./editableNsInput.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditableNsInput), multi: true,
    }]
})
export class EditableNsInput implements ControlValueAccessor {

    //input for local name (both with and without placeholder), used to focus the input element
    @ViewChild("lnWithPH") lnWithPH: ElementRef;
    @ViewChild("lnWithoutPH") lnWithoutPH: ElementRef;

    @Input() placeholder: string;
    @Input() toFocus: boolean; //tells if the input field should be focused

    namespaceLocked: boolean = true;
    private namespace: string;
    private namespacePristine: string;
    private localName: string;
    private uri: string;

    constructor() { }

    ngOnInit() {
        this.namespace = VBContext.getWorkingProject().getDefaultNamespace();
        this.namespacePristine = this.namespace;
    }

    ngAfterViewInit() {
        //if toFocus input is true, focus the local name input field (distinguish the two inputs w/ or w/o placeholder)
        if (this.toFocus) {
            if (this.placeholder) {
                this.lnWithPH.nativeElement.focus();
            } else {
                this.lnWithoutPH.nativeElement.focus();
            }
        }
    }

    unlockNamespace() {
        this.namespaceLocked = !this.namespaceLocked;
        if (this.namespaceLocked) { //from free uri to locked namespace
            this.fromUriToNamespaceAndLocalName();
            this.propagateChange(this.namespace + this.localName);
        } else { //from locked namespace to free uri
            this.uri = this.namespace + (this.localName != null ? this.localName : "");
            this.propagateChange(this.uri);
        }
    }

    private fromUriToNamespaceAndLocalName() {
        let separatorIdx: number = this.uri.lastIndexOf("#");
        if (separatorIdx < 0) {
            separatorIdx = this.uri.lastIndexOf("/");
        }
        if (separatorIdx > 0) {
            this.localName = this.uri.substring(separatorIdx + 1);
        } else { //no / or # in the uri => restore the original namespace
            this.localName = null;
        }
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        if (obj) {
            this.uri = obj;
            this.fromUriToNamespaceAndLocalName();
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

    onModelChanged() {
        if (this.namespaceLocked) {
            if (this.localName != null && this.localName.trim() != "") {
                this.propagateChange(this.namespace + this.localName);
            } else {
                this.propagateChange(null);
            }
        } else {
            this.propagateChange(this.uri);
        }
    }

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

}