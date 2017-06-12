import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { ARTURIResource, ARTLiteral } from "../../../../models/ARTResources";
import { XmlSchema, SKOS } from "../../../../models/Vocabulary";

export class NewTypedLiteralModalData extends BSModalContext {

    /**
     * @param allowedDatatypes array of datatype URIs of the allowed datatypes in the typed literal creation.
     * If null all the datatypes are allowed
     */
    constructor(
        public title: string = 'Create new label',
        public allowedDatatypes: Array<ARTURIResource>
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

    private submitted: boolean = false;
    private value: any;
    private datatype: ARTURIResource;

    constructor(public dialog: DialogRef<NewTypedLiteralModalData>) {
        this.context = dialog.context;
    }

    private isInputValid(): boolean {
        var valid: boolean = false;
        if (this.value != undefined) {
            if (this.datatype.getURI() == XmlSchema.string.getURI()) {
                valid = this.value.trim() != "";// if value is string, it's valid only if is not an empty string
            } else if (this.datatype.getURI() == XmlSchema.float.getURI()) {
                valid = new RegExp("^[\-\+]?[0-9]+(\.[0-9]+)?$").test(this.value);
            } else if (this.datatype.getURI() == XmlSchema.integer.getURI()) {
                valid = new RegExp("^[\-\+]?[0-9]+$").test(this.value);
            } else {
                valid = true;
            }
        }
        return valid;
    }

    private onDatatypeChange(datatype: ARTURIResource) {
        this.datatype = datatype;
    }

    ok(event: Event) {
        this.submitted = true;
        if (this.isInputValid()) {
            this.dialog.close(new ARTLiteral(this.value, this.datatype.getURI()));
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}