import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTLiteral, ARTURIResource, ResourceUtils } from "../../models/ARTResources";
import { RDF, RDFS, XmlSchema } from "../../models/Vocabulary";
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
    @Output() langChange: EventEmitter<string> = new EventEmitter();

    private datatypeList: ARTURIResource[];
    private datatype: ARTURIResource;

    private lang: string; //optional, used only if datatype is xsd:string or rdfs:langString

    private numericInput: boolean = false;
    private inputNumberSign: "positive" | "negative" | "any" = "any";

    private stringValue: string;
    
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
                this.onDatatypeChange();
            }
        );
    }


    /**
     * Returns true if the current datatype doesn't admit all values.
     * (e.g. boolean admits only true and false, time admits values like hh:mm:ss, ...)
     */
    private isDatatypeBound(): boolean {
        if (this.datatype) {
            return (
                this.datatype.getURI() == XmlSchema.boolean.getURI() || this.datatype.getURI() == XmlSchema.date.getURI() ||
                this.datatype.getURI() == XmlSchema.dateTime.getURI() || this.datatype.getURI() == XmlSchema.time.getURI()
            );
        } else {
            return false;
        }
        
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
        this.updateInputConfiguration();
        this.datatypeChange.emit(this.datatype);
        this.stringValue = null;
        this.onValueChanged();
    }

    private updateInputConfiguration() {
        this.numericInput = (
            this.datatype.getURI() == XmlSchema.byte.getURI() ||
            this.datatype.getURI() == XmlSchema.decimal.getURI() ||
            this.datatype.getURI() == XmlSchema.double.getURI() ||
            this.datatype.getURI() == XmlSchema.float.getURI() ||
            this.datatype.getURI() == XmlSchema.int.getURI() ||
            this.datatype.getURI() == XmlSchema.integer.getURI() ||
            this.datatype.getURI() == XmlSchema.long.getURI() ||
            this.datatype.getURI() == XmlSchema.negativeInteger.getURI() ||
            this.datatype.getURI() == XmlSchema.nonNegativeInteger.getURI() ||
            this.datatype.getURI() == XmlSchema.nonPositiveInteger.getURI() ||
            this.datatype.getURI() == XmlSchema.positiveInteger.getURI() ||
            this.datatype.getURI() == XmlSchema.short.getURI() ||
            this.datatype.getURI() == XmlSchema.unsignedByte.getURI() ||
            this.datatype.getURI() == XmlSchema.unsignedInt.getURI() ||
            this.datatype.getURI() == XmlSchema.unsignedLong.getURI() ||
            this.datatype.getURI() == XmlSchema.unsignedShort.getURI()
        );
        //sign
        if (
            this.datatype.getURI() == XmlSchema.nonNegativeInteger.getURI() ||
            this.datatype.getURI() == XmlSchema.positiveInteger.getURI() ||
            this.datatype.getURI() == XmlSchema.unsignedByte.getURI() ||
            this.datatype.getURI() == XmlSchema.unsignedInt.getURI() ||
            this.datatype.getURI() == XmlSchema.unsignedLong.getURI() ||
            this.datatype.getURI() == XmlSchema.unsignedShort.getURI()
        ) {
            this.inputNumberSign = "positive";
        } else if (
            this.datatype.getURI() == XmlSchema.negativeInteger.getURI() ||
            this.datatype.getURI() == XmlSchema.nonPositiveInteger.getURI()
        ) {
            this.inputNumberSign = "negative";
        } else {
            this.inputNumberSign = "any";
        }
    }

    private onLangChanged() {
        this.langChange.emit(this.lang);
        this.onValueChanged();
    }

    private onValueChanged() {
        if (this.stringValue == null) {
            this.propagateChange(null);    
        } else {
            if (this.datatype.getURI() != RDF.langString.getURI()) {
                this.lang = null;
            }
            this.propagateChange(new ARTLiteral(this.stringValue+"", this.datatype.getURI(), this.lang));
        }
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: ARTLiteral) {
        if (obj != null) {
            this.stringValue = obj.getValue();
            let dt: string = obj.getDatatype();
            if (dt != null) {
                this.datatypeList.forEach(el => {
                    if (el.getURI() == dt)  {
                        this.datatype = el;
                    }
                });
            }
            this.lang = obj.getLang();
        } else {
            this.stringValue = null;
            this.datatype = null;
            this.lang = null;
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

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: ARTLiteral) => { };

    //--------------------------------------------------

}