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
    @Input('datatype') inputDatatype: ARTURIResource; //the selected datatype. If provided as input, force the default
    @Output() datatypeChange: EventEmitter<ARTURIResource> = new EventEmitter();
    @Output() langChange: EventEmitter<string> = new EventEmitter();

    private datatypeList: ARTURIResource[];
    private selectedDatatype: ARTURIResource;

    private lang: string; //optional, used only if datatype is xsd:string or rdfs:langString

    private numericInput: boolean = false;
    private inputNumberSign: "positive" | "negative" | "any" = "any";

    private stringValue: string;
    
    constructor(private datatypeService: DatatypesServices) {}

    ngOnInit() {
        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                /**
                 * init datatype list
                 */
                //sort
                datatypes.sort((dt1: ARTURIResource, dt2: ARTURIResource) => {
                    return dt1.getShow().localeCompare(dt2.getShow());
                });
                this.datatypeList = datatypes;
                //filter out not allowed datatypes
                if (this.allowedDatatypes != undefined) {
                    if (this.allowedDatatypes[0].equals(RDFS.literal)) {
                        //if allowedDatatypes contains only rdfs:Literal => allow every datatype
                    } else { //otherwise filter out
                        for (let i = this.datatypeList.length-1; i >= 0; i--) {
                            //if datatype is not allowed (not among the allowed) remove it
                            if (ResourceUtils.indexOfNode(this.allowedDatatypes, this.datatypeList[i]) == -1) {
                                this.datatypeList.splice(i, 1);
                            }
                        }
                    }
                }

                /**
                 * Init selected datatype
                 */
                if (this.inputDatatype != null) {
                    this.initDatatype(this.inputDatatype);
                }
                if (this.selectedDatatype == null) { //datatype null (not provided as @Input or the input not found among the available)
                    this.initDatatype(XmlSchema.string); //set xsd:string as default
                }
                if (this.selectedDatatype == null) { //if still null => set the first
                    this.selectedDatatype = this.datatypeList[0];
                }
                this.onDatatypeChange();
            }
        );
    }

    /**
     * Set the provided datatype as selected in the list. If not found select xml:string as default.
     * If neither xml:string is found, set the first
     * @param datatype 
     */
    private initDatatype(datatype: ARTURIResource) {
        let idx = ResourceUtils.indexOfNode(this.datatypeList, datatype);
        if (idx != -1) { //datatype found in datatype list => select it
            this.selectedDatatype = this.datatypeList[idx];
        }
    }


    /**
     * Returns true if the current datatype doesn't admit all values.
     * (e.g. boolean admits only true and false, time admits values like hh:mm:ss, ...)
     */
    private isDatatypeBound(): boolean {
        if (this.selectedDatatype) {
            return (
                this.selectedDatatype.equals(XmlSchema.boolean) || this.selectedDatatype.equals(XmlSchema.date) ||
                this.selectedDatatype.equals(XmlSchema.dateTime) || this.selectedDatatype.equals(XmlSchema.time)
            );
        } else {
            return false;
        }
    }

    private onDatatypeChange() {
        this.updateInputConfiguration();
        this.datatypeChange.emit(this.selectedDatatype);
        this.stringValue = null;
        this.onValueChanged();
    }

    private updateInputConfiguration() {
        this.numericInput = (
            this.selectedDatatype.equals(XmlSchema.byte) ||
            this.selectedDatatype.equals(XmlSchema.decimal) ||
            this.selectedDatatype.equals(XmlSchema.double) ||
            this.selectedDatatype.equals(XmlSchema.float) ||
            this.selectedDatatype.equals(XmlSchema.int) ||
            this.selectedDatatype.equals(XmlSchema.integer) ||
            this.selectedDatatype.equals(XmlSchema.long) ||
            this.selectedDatatype.equals(XmlSchema.negativeInteger) ||
            this.selectedDatatype.equals(XmlSchema.nonNegativeInteger) ||
            this.selectedDatatype.equals(XmlSchema.nonPositiveInteger) ||
            this.selectedDatatype.equals(XmlSchema.positiveInteger) ||
            this.selectedDatatype.equals(XmlSchema.short) ||
            this.selectedDatatype.equals(XmlSchema.unsignedByte) ||
            this.selectedDatatype.equals(XmlSchema.unsignedInt) ||
            this.selectedDatatype.equals(XmlSchema.unsignedLong) ||
            this.selectedDatatype.equals(XmlSchema.unsignedShort)
        );
        //sign
        if (
            this.selectedDatatype.equals(XmlSchema.nonNegativeInteger) ||
            this.selectedDatatype.equals(XmlSchema.positiveInteger) ||
            this.selectedDatatype.equals(XmlSchema.unsignedByte) ||
            this.selectedDatatype.equals(XmlSchema.unsignedInt) ||
            this.selectedDatatype.equals(XmlSchema.unsignedLong) ||
            this.selectedDatatype.equals(XmlSchema.unsignedShort)
        ) {
            this.inputNumberSign = "positive";
        } else if (
            this.selectedDatatype.equals(XmlSchema.negativeInteger) ||
            this.selectedDatatype.equals(XmlSchema.nonPositiveInteger)
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
            if (this.selectedDatatype.getURI() != RDF.langString.getURI()) {
                this.lang = null;
            }
            this.propagateChange(new ARTLiteral(this.stringValue+"", this.selectedDatatype.getURI(), this.lang));
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
                        this.selectedDatatype = el;
                    }
                });
            }
            this.lang = obj.getLang();
        } else {
            this.stringValue = null;
            //the following two lines have been commented in order to avoid to "reset" also the lang or the datatype in case of the bound value is null
            // this.selectedDatatype = null;
            // this.lang = null;
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