import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTLiteral, ARTURIResource } from "../../../../models/ARTResources";
import { DatatypeValidator } from "../../../../utils/DatatypeValidator";
import { ResourceUtils } from "../../../../utils/ResourceUtils";
import { VBContext } from "../../../../utils/VBContext";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { ModalType } from '../../Modals';

@Component({
    selector: "new-typed-lang-modal",
    templateUrl: "./newTypedLiteralModal.html",
})
export class NewTypedLiteralModal {

    @Input() title: string = 'Create new label';
    @Input() predicate: ARTURIResource;
    @Input() allowedDatatypes: Array<ARTURIResource>;
    @Input() dataRanges: Array<ARTLiteral[]>;
    @Input() multivalue: boolean = false;
    @Input() validate: boolean = false;

    showAspectSelector: boolean = false;
    typedLiteralAspectSelector: string = "Typed literal";
    dataRangeAspectSelector: string = "DataRange";
    private aspectSelectors: string[] = [this.typedLiteralAspectSelector, this.dataRangeAspectSelector];
    selectedAspectSelector: string = this.aspectSelectors[0];

    private datatype: ARTURIResource;
    private value: ARTLiteral; //value inserted by the user or selected among the datarange
    private notValidatableType: boolean = false;

    private selectedDataRange: ARTLiteral[]; //selected list of dataranges among which chose one

    values: ARTLiteral[] = [];

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices, private dtValidator: DatatypeValidator) {}

    ngOnInit() {
        if (this.allowedDatatypes != null && this.dataRanges != null) {
            this.showAspectSelector = true;
            this.selectedDataRange = this.dataRanges[0];
        } else if (this.allowedDatatypes != null) {
            this.selectedAspectSelector = this.typedLiteralAspectSelector;
        } else if (this.dataRanges != null) {
            this.selectedAspectSelector = this.dataRangeAspectSelector;
            this.selectedDataRange = this.dataRanges[0];
        } else { //both allowedDatatypes and dataRanges null
            this.selectedAspectSelector = this.typedLiteralAspectSelector;
        }
    }

    private addValue() {
        if (this.selectedAspectSelector == this.typedLiteralAspectSelector) {
            if (this.validate && this.dtValidator.isValid(this.value, this.datatype)) {
                this.values.push(this.value);
                this.value = null;
            } else {
                this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_VALUE_FOR_DATATYPE", params:{value: this.value.getValue(), datatype: this.datatype.getShow()}},
                    ModalType.warning);
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
    isOkEnabled(): boolean {
        return this.values.length > 0 || (this.value != null && this.value.getValue() != "");
    }

    /**
     * Determines if the warning icon is shown.
     * The icon warns the user if there is a value typed/selected but not added in mutlivalue mode
     */
    isOkWarningActive(): boolean {
        return this.values.length > 0 && this.value != null;
    }

    ok() {
        let literals: ARTLiteral[];
        if (this.multivalue) {
            if (this.values.length > 0) { //there are multiple values (no need to validate since the validation has been done for each added value)
                literals = this.values;
            } else { //no multiple values => return the input value
                if (this.selectedAspectSelector == this.typedLiteralAspectSelector) {
                    //first validate
                    if (this.validate && !this.dtValidator.isValid(this.value, this.datatype)) {
                        this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_VALUE_FOR_DATATYPE", params:{value: this.value.getValue(), datatype: this.datatype.getShow()}},
                            ModalType.warning);
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
                if (this.validate && !this.dtValidator.isValid(this.value, this.datatype)) {
                    this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_VALUE_FOR_DATATYPE", params:{value: this.value.getValue(), datatype: this.datatype.getShow()}},
                        ModalType.warning);
                    return;
                }
                literals = [this.value];
            } else { //selected dataRangeAspectSelector
                literals = [this.value];
            }
        }
        this.activeModal.close(literals);
    }
    

    close() {
        this.activeModal.dismiss();
    }

}