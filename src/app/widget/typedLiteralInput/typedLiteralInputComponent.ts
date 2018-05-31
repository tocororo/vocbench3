import { Component, EventEmitter, Input, Output, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTURIResource, ResourceUtils } from "../../models/ARTResources";
import { RDFS, XmlSchema } from "../../models/Vocabulary";
import { DatatypesServices } from "../../services/datatypesServices";

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

    private datatypeList: ARTURIResource[];
    private datatype: ARTURIResource;

    private value: string;

    constructor(private datatypeService: DatatypesServices) {}

    ngOnInit() {

        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                datatypes.sort((dt1: ARTURIResource, dt2: ARTURIResource) => {
                    return dt1.getShow().localeCompare(dt2.getShow());
                });
                this.datatypeList = datatypes;

                //re-initialize allowedDatatypes in case its sole element is rdfs:Literal
                if (this.allowedDatatypes != undefined && this.allowedDatatypes[0].getURI() == RDFS.literal.getURI()) {
                    this.allowedDatatypes = undefined; //so it allows all the datatypes
                }
                //initialize default datatype...
                if (this.allowedDatatypes == undefined) {//...to xsd:string if no allowedDatatypes is specified
                    this.datatype = this.datatypeList[ResourceUtils.indexOfNode(this.datatypeList, XmlSchema.string)];
                } else {
                    //check if in allowedDatatypes there is some datatype not foreseen by datatypeList. In case, add it to datatypeList
                    this.allowedDatatypes.forEach(dt => { 
                        if (ResourceUtils.indexOfNode(this.datatypeList, dt) == -1) {
                            this.datatypeList.push(dt);
                        }
                    });
                    //...to xsd:string if it is among the allowedDatatype
                    if (this.allowedDatatypes.findIndex(dt => dt.getURI() == XmlSchema.string.getURI()) != -1) {
                        this.datatype = this.datatypeList[ResourceUtils.indexOfNode(this.datatypeList, XmlSchema.string)];
                    } else {//...to the first datatype in datatypeList that is in allowedDatatypes
                        this.datatype = this.datatypeList[this.datatypeList.findIndex(dt => dt.getURI() == this.allowedDatatypes[0].getURI())];
                    }
                }
                this.datatypeChange.emit(this.datatype);
                this.propagateChange(this.value);
            }
        );
    }


    /**
     * Returns true if the current datatype doesn't admit all values.
     * (e.g. boolean admits only true and false, time admits values like hh:mm:ss, ...)
     */
    private isDatatypeBound(): boolean {
        return (
            this.datatype.getURI() == XmlSchema.boolean.getURI() || this.datatype.getURI() == XmlSchema.date.getURI() ||
            this.datatype.getURI() == XmlSchema.dateTime.getURI() || this.datatype.getURI() == XmlSchema.time.getURI()
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
        this.value = obj;
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