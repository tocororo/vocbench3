import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTLiteral, ARTURIResource } from "../../../../models/ARTResources";
import { RDF } from "../../../../models/Vocabulary";
import { ResourceUtils } from "../../../../utils/ResourceUtils";
import { VBContext } from "../../../../utils/VBContext";
import { DatatypeValidator } from "../../../../utils/DatatypeValidator";
import { BasicModalServices } from "../../basicModal/basicModalServices";

export class NewTypedLiteralModalData extends BSModalContext {

    /**
     * @param predicate the (optional) predicate that is going to enrich with the typed literal
     * @param allowedDatatypes array of datatype URIs of the allowed datatypes in the typed literal creation.
     * If null all the datatypes are allowed
     * @param dataRanges if provided, tells which values can be created/chosed (e.g. xml:string ["male", "female"])
     */
    constructor(
        public title: string = 'Create new label',
        public predicate: ARTURIResource,
        public allowedDatatypes: Array<ARTURIResource>,
        public dataRanges: Array<ARTLiteral[]>,
        public multivalue: boolean = false,
        public validate: boolean = false
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

    private showAspectSelector: boolean = false;
    private typedLiteralAspectSelector: string = "Typed literal";
    private dataRangeAspectSelector: string = "DataRange";
    private aspectSelectors: string[] = [this.typedLiteralAspectSelector, this.dataRangeAspectSelector];
    private selectedAspectSelector: string = this.aspectSelectors[0];

    private datatype: ARTURIResource;
    private value: ARTLiteral; //value inserted by the user or selected among the datarange
    private notValidatableType: boolean = false;

    private selectedDataRange: ARTLiteral[]; //selected list of dataranges among which chose one

    private values: ARTLiteral[] = [];

    constructor(public dialog: DialogRef<NewTypedLiteralModalData>, private basicModals: BasicModalServices, private dtValidator: DatatypeValidator) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.allowedDatatypes != null && this.context.dataRanges != null) {
            this.showAspectSelector = true;
            this.selectedDataRange = this.context.dataRanges[0];
        } else if (this.context.allowedDatatypes != null) {
            this.selectedAspectSelector = this.typedLiteralAspectSelector;
        } else if (this.context.dataRanges != null) {
            this.selectedAspectSelector = this.dataRangeAspectSelector;
            this.selectedDataRange = this.context.dataRanges[0];
        } else { //both allowedDatatypes and dataRanges null
            this.selectedAspectSelector = this.typedLiteralAspectSelector;
        }
    }

    private addValue() {
        if (this.selectedAspectSelector == this.typedLiteralAspectSelector) {
            if (this.context.validate && this.dtValidator.isValid(this.value, this.datatype)) {
                this.values.push(this.value);
                this.value = null;
            } else {
                this.basicModals.alert("Invalid value", "The inserted value '" + this.value.getValue() + "' is not a valid " + this.datatype.getShow(), "warning");
                return;
            }
        } else { //selected dataRangeAspectSelector
            this.values.push(this.value);
            this.value = null;
        }
    }

    /**
     * Add value enabled in case the adding value is not already been added in the values list
     */
    private isAddValueEnabled() {
        return this.value != null && this.value.getValue() != "" && !ResourceUtils.containsNode(this.values, this.value)
    }

    private removeValue(value: ARTLiteral) {
        this.values.splice(this.values.indexOf(value), 1);
    }

    private getDataRangePreview(dataRange: ARTLiteral[]): string {
        var preview: string = "OneOf: [";
        for (var i = 0; i < dataRange.length; i++) {
            let v: ARTLiteral = dataRange[i];
            preview += JSON.stringify(v.getValue());
            let dtQname = ResourceUtils.getQName(v.getDatatype(), VBContext.getPrefixMappings());
            if (dtQname == v.getDatatype()) {
                dtQname = "<" + v.getDatatype() + ">";
            }
            preview += "^^" + dtQname;
            preview += ", "
            if (i == 2 && dataRange.length > 3) { //stops the preview at the third element (if there are more)
                preview += "...";
                break;
            }
        }
        preview += "]";
        return preview;
    }

    private onDatatypeChange(datatype: ARTURIResource) {
        this.datatype = datatype;
        this.notValidatableType = !this.dtValidator.isValidableType(datatype);
    }

    /**
     * Determines if the Ok button is enabled.
     * Ok is enabled in case multiple values are added or if a single value is valid
     */
    private isOkEnabled(): boolean {
        return this.values.length > 0 || (this.value != null && this.value.getValue() != "");
    }

    /**
     * Determines if the warning icon is shown.
     * The icon warns the user if there is a value typed/selected but not added in mutlivalue mode
     */
    private isOkWarningActive(): boolean {
        return this.values.length > 0 && this.value != null;
    }

    ok(event: Event) {
        let literals: ARTLiteral[];
        if (this.context.multivalue) {
            if (this.values.length > 0) { //there are multiple values (no need to validate since the validation has been done for each added value)
                literals = this.values;
            } else { //no multiple values => return the input value
                if (this.selectedAspectSelector == this.typedLiteralAspectSelector) {
                    //first validate
                    if (this.context.validate && !this.dtValidator.isValid(this.value, this.datatype)) {
                        this.basicModals.alert("Invalid value", "The inserted value '" + this.value.getValue() + "' is not a valid " + this.datatype.getShow(), "warning");
                        return;
                    }
                    literals = [this.value];
                } else { //selected dataRangeAspectSelector
                    literals = [this.value];
                }
            }
        } else {
            if (this.selectedAspectSelector == this.typedLiteralAspectSelector) {
                //first validate
                if (this.context.validate && !this.dtValidator.isValid(this.value, this.datatype)) {
                    this.basicModals.alert("Invalid value", "The inserted value '" + this.value.getValue() + "' is not a valid " + this.datatype.getShow(), "warning");
                    return;
                }
                literals = [this.value];
            } else { //selected dataRangeAspectSelector
                literals = [this.value];
            }
        }
        this.dialog.close(literals);
    }
    

    cancel() {
        this.dialog.dismiss();
    }

}