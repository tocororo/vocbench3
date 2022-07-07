import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTLiteral } from "../../../../models/ARTResources";
import { LanguageConstraint } from "../../../../models/LanguagesCountries";

@Component({
    selector: "new-plain-literal-modal",
    templateUrl: "./newPlainLiteralModal.html",
})
export class NewPlainLiteralModal {
    @Input() title: string = 'Create new label';
    @Input() value: string;
    @Input() valueReadonly: boolean = false;
    @Input() lang: string;
    @Input() langReadonly: boolean = false;
    @Input() langConstraints: LanguageConstraint = { constrain: false, locale: true };
    @Input() multivalueOpt: { enabled: boolean, allowSameLang: boolean } = { enabled: false, allowSameLang: true };

    viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    values: ARTLiteral[] = [];

    constructor(public activeModal: NgbActiveModal, private changeDetectorRef: ChangeDetectorRef) { }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.changeDetectorRef.detectChanges();
    }

    onEnter(event: KeyboardEvent) {
        if (!event.shiftKey) { //when enter is not in combo with shift (which insert a newline)
            if (this.values.length == 0 && this.isInputValid()) { //only when the input value is the only one
                this.ok();
            }
        }
    }

    isInputValid(): boolean {
        return (this.value != undefined && this.value.trim() != "");
    }

    addValue() {
        this.values.push(new ARTLiteral(this.value, null, this.lang));
        this.value = null;
    }

    removeValue(value: ARTLiteral) {
        this.values.splice(this.values.indexOf(value), 1);
    }

    private isDuplicateLangViolated() {
        /**
         * Duplicated lang only in case the modal doesn't allow multiple value with same lang,
         * the user is writing a new label with the same language of a label already addded to the values array
         */
        let violated: boolean = false;
        if (!this.multivalueOpt.allowSameLang && this.value != null && this.value.length > 0) {
            this.values.forEach((v: ARTLiteral) => {
                if (v.getLang() == this.lang) {
                    violated = true;
                }
            });
        }
        return violated;
    }

    isOkWarningActive(): boolean {
        return (this.values.length > 0 && this.value != null && this.value.trim() != "");
    }

    /**
     * Determines if the button for adding multiple labels is enabled.
     * Add value is enabled only if:
     * - the inserted label is not empty 
     * - the lang is specified (it could be omitted if user has no assigned langs)
     * - there is no already a label with the same lang (if duplicated lang is enabled)
     */
    isAddValueEnabled() {
        return (
            this.value != null && this.value.trim() != "" &&
            this.lang != null &&
            !this.isDuplicateLangViolated()
        );
    }

    /**
     * Determines if the Ok button is enabled.
     * Ok is enabled in case multiple values are added or if a single value is valid
     */
    isOkEnabled(): boolean {
        return this.values.length > 0 || (this.isInputValid() && this.lang != null);
    }

    ok() {
        let labels: ARTLiteral[];
        if (this.multivalueOpt.enabled) {
            if (this.values.length > 0) { //there are multiple values
                labels = this.values;
            } else { //no multiple values => return the input label
                labels = [new ARTLiteral(this.value, null, this.lang)];
            }
        } else {
            labels = [new ARTLiteral(this.value, null, this.lang)];
        }
        this.activeModal.close(labels);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}