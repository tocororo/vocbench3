import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource} from "../../../utils/ARTResources";
import {XmlSchema, SKOS} from "../../../utils/Vocabulary";

export class NewTypedLiteralModalData extends BSModalContext {
    
    /**
     * @param allowedDatatypes array of datatype URIs of the allowed datatypes in the typed literal creation.
     * If null all the datatypes are allowed
     */
    constructor(
        public title: string = 'Create new label',
        public allowedDatatypes: Array<string>
    ) {
        super();
    }
}

@Component({
    selector: "new-typed-lang-modal",
    templateUrl: "./newTypedLiteralModal.html",
})
export class NewTypedLiteralModal implements ModalComponent<NewTypedLiteralModalData> {
    context: NewTypedLiteralModalData;
    
    private datatypes: Array<string> = [
        XmlSchema.boolean.getURI(), XmlSchema.date.getURI(), XmlSchema.dateTime.getURI(), XmlSchema.float.getURI(),
        XmlSchema.integer.getURI(), XmlSchema.string.getURI(), XmlSchema.time.getURI()
    ];
    
    private submitted: boolean = false;
    private value: any;
    private datatype: string;
    
    constructor(public dialog: DialogRef<NewTypedLiteralModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
        //initialize default datatype to xsd:string if allowed, to the first allowed otherwise
        if (this.context.allowedDatatypes == undefined) {
            this.datatype = XmlSchema.string.getURI();
        } else {
            if (this.context.allowedDatatypes.indexOf(XmlSchema.string.getURI()) != -1) {
                this.datatype = XmlSchema.string.getURI();       
            } else {
                this.datatype = this.context.allowedDatatypes[0];
            }       
        }
    }
    
    /**
     * Returns true if the current datatype doesn't admit all values.
     * (e.g. boolean admits only true and false, time admits values like hh:mm:ss, ...)
     */
    private isDatatypeBound() {
        return (this.datatype == XmlSchema.boolean.getURI() || this.datatype == XmlSchema.date.getURI() ||
            this.datatype == XmlSchema.dateTime.getURI() || this.datatype == XmlSchema.time.getURI());
    }
    
    /**
     * Tells if the given datatype is allowed in the current typed literal creation
     * Useful to enable/disable the selection of the <option> in the <select> of the datatypes
     */
    private isDatatypeAllowed(datatype: string): boolean {
        if (this.context.allowedDatatypes == undefined) {
            return true; //if no allowedDatatypes array is provided, then all datatypes are allowed
        } else {
            return this.context.allowedDatatypes.indexOf(datatype) != -1;
        }
    }
    
    private isInputValid(): boolean {
        var valid: boolean = false;
        if (this.value != undefined) {
            if (this.datatype == XmlSchema.string.getURI()) {
                valid = this.value.trim() != "";// if value is string, it's valid only if is not an empty string
            } else if (this.datatype == XmlSchema.float.getURI()) {
                valid = new RegExp("^[\-\+]?[0-9]+(\.[0-9]+)?$").test(this.value);
            } else if (this.datatype == XmlSchema.integer.getURI()) {
                valid = new RegExp("^[\-\+]?[0-9]+$").test(this.value);
            } else {
                valid = true;
            }
        }
        return valid;
    }
    
    ok(event) {
        this.submitted = true;
        if (this.isInputValid()) {
            this.dialog.close({value: this.value, datatype: this.datatype});    
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}