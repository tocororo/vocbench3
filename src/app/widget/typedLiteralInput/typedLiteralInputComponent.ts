import { Component, Input, Output, EventEmitter, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { XmlSchema, RDFS } from "../../models/Vocabulary";
import { ARTURIResource } from "../../models/ARTResources";

@Component({
    selector: "typed-literal-input",
    templateUrl: "./typedLiteralInputComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TypedLiteralInputComponent), multi: true,
    }]
})
export class TypedLiteralInputComponent implements ControlValueAccessor {

    @Input() allowedDatatypes: ARTURIResource[]; //the datatypes allowed by the component
    @Output() datatypeChange: EventEmitter<ARTURIResource> = new EventEmitter();

    private datatypeList: ARTURIResource[] = XmlSchema.DATATYPES;
    private datatype: ARTURIResource;

    private value: string;

    ngOnInit() {
        //re-initialize allowedDatatypes in case its sole element is rdfs:Literal
        if (this.allowedDatatypes != undefined && this.allowedDatatypes[0].getURI() == RDFS.literal.getURI()) {
            this.allowedDatatypes = undefined; //so it allows all the datatypes
        }
        //initialize default datatype to xsd:string if allowed, to the first allowed otherwise
        if (this.allowedDatatypes == undefined) {
            this.datatype = XmlSchema.string;
        } else {
            if (this.allowedDatatypes.findIndex(dt => dt.getURI() == XmlSchema.string.getURI()) != -1) {
                this.datatype = XmlSchema.string;
            } else {
                this.datatype = this.datatypeList[this.datatypeList.findIndex(dt => dt.getURI() == this.allowedDatatypes[0].getURI())];
            }
        }
        this.datatypeChange.emit(this.datatype);
        this.propagateChange(this.value);
    }

    /**
     * Returns true if the current datatype doesn't admit all values.
     * (e.g. boolean admits only true and false, time admits values like hh:mm:ss, ...)
     */
    private isDatatypeBound(): boolean {
        return (
            this.datatype == XmlSchema.boolean || this.datatype == XmlSchema.date ||
            this.datatype == XmlSchema.dateTime || this.datatype == XmlSchema.time
        );
    }

    /**
     * Tells if the given datatype is allowed in the current typed literal creation
     * Useful to enable/disable the selection of the <option> in the <select> of the datatypes
     */
    private isDatatypeAllowed(datatype: ARTURIResource): boolean {
        if (this.allowedDatatypes == undefined) {
            return true; //if no allowedDatatypes array is provided, then all datatypes are allowed
        } else {
            return this.allowedDatatypes.findIndex(dt => dt.getURI() == datatype.getURI()) != -1;
        }
    }

    private onDatatypeChange() {
        this.value = null;
        this.propagateChange(this.value);
        this.datatypeChange.emit(this.datatype);
    }

    private onValueChanged() {
        this.propagateChange(this.value);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        // if (obj) {
            this.value = obj;
        // }
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

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

    //--------------------------------------------------

}