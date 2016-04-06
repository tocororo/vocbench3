import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from "../../../utils/ARTResources";
import {XmlSchema, SKOS} from "../../../utils/Vocabulary";

export class NewTypedLiteralModalContent {
    public title: string = 'Create new label';
    constructor(title: string) {
        this.title = title;
    }
}

@Component({
    selector: "new-typed-lang-modal",
    templateUrl: "app/src/widget/modal/newTypedLiteralModal/newTypedLiteralModal.html",
})
export class NewTypedLiteralModal implements ICustomModalComponent {
    
    private datatypes: Array<string> = [
        XmlSchema.boolean.getURI(), XmlSchema.date.getURI(), XmlSchema.dateTime.getURI(), XmlSchema.float.getURI(),
        XmlSchema.integer.getURI(), XmlSchema.string.getURI(), XmlSchema.time.getURI()];
    
    private submitted: boolean = false;
    private value: any;
    private datatype: string = XmlSchema.string.getURI();
    
    dialog: ModalDialogInstance;
    context: NewTypedLiteralModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <NewTypedLiteralModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }
    
    /**
     * Returns true if the current datatype doesn't admit all values.
     * (e.g. boolean admits only true and false, time admits values like hh:mm:ss, ...)
     */
    private isDatatypeBound() {
        return (this.datatype == XmlSchema.boolean.getURI() || this.datatype == XmlSchema.date.getURI() ||
            this.datatype == XmlSchema.dateTime.getURI() || this.datatype == XmlSchema.time.getURI());
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
            event.stopPropagation();
            event.preventDefault();
            this.dialog.close({value: this.value, datatype: this.datatype});    
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}