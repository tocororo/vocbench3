import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { SKOSXL } from "../../../../../models/Vocabulary";
import { BasicModalServices } from "../../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";

export class NewXLabelModalData extends BSModalContext {
    /**
     * @param title the title of the modal dialog
     * @param value the value inserted by default
     * @param valueReadonly if true the input field is disable and cannot be changed
     * @param lang the language selected by default
     * @param langReadonly if true the language selection is disable and language cannot be changed
     * @param clsChangeable if true allow to change the type of the xlabel
     * @param multiLabelOpt if true allow to enter multiple label
     */
    constructor(
        public title: string = 'Create new label',
        public value: string,
        public valueReadonly: boolean = false,
        public lang: string,
        public langReadonly: boolean = false,
        public clsChangeable: boolean = true,
        public multiLabelOpt: { enabled: boolean, prefLabel?: boolean } = { enabled: false }
    ) {
        super();
    }
}

@Component({
    selector: "new-xlabel-modal",
    templateUrl: "/newXLabelModal.html",
})
export class NewXLabelModal implements ModalComponent<NewXLabelModalData> {
    context: NewXLabelModalData;

    private viewInitialized: boolean = false; //in order to avoid ugly UI effect on the alert showed if no language is available

    private value: string;
    private lang: string;

    private labelClass: ARTURIResource = SKOSXL.label;

    private values: ARTLiteral[] = [];

    constructor(public dialog: DialogRef<NewXLabelModalData>, private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
        this.value = this.context.value;
        document.getElementById("toFocus").focus();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            if (!event.shiftKey && !event.altKey && !event.ctrlKey) {
                if (this.values.length == 0 && this.isInputValid()) { //only when the input value is the only one
                    this.ok(event);
                }
            }
        }
    }

    private changeClass() {
        let rootClass: ARTURIResource = SKOSXL.label;
        this.browsingModals.browseClassTree("Change class", [rootClass]).then(
            (selectedClass: any) => {
                this.labelClass = selectedClass;
            },
            () => { }
        );
    }

    private isInputValid(): boolean {
        return (this.value != undefined && this.value.trim() != "");
    }

    private addValue() {
        this.values.push(new ARTLiteral(this.value, null, this.lang));
        this.value = null;
    }

    private removeValue(value: ARTLiteral) {
        this.values.splice(this.values.indexOf(value), 1);
    }

    private isDuplicateLangViolated() {
        /**
         * Duplicated lang only in case the modal is creating preferred label(s), the user is writing a new label with the same language
         * of a label already addded to the values array
         */
        let violated: boolean = false;
        if (!this.context.multiLabelOpt.prefLabel && this.value != null && this.value.length > 0) {
            this.values.forEach((v: ARTLiteral) => {
                if (v.getLang() == this.lang) {
                    violated = true;
                }
            });
        }
        return violated;
    }

    private isOkWarningActive(): boolean {
        return (this.values.length > 0 && this.value != null && this.value.trim() != "")
    }

    /**
     * Determines if the button for adding multiple labels is enabled.
     * Add value is enabled only if:
     * - the inserted label is not empty 
     * - the lang is specified (it could be omitted if user has no assigned langs)
     * - there is no already a label with the same lang (if duplicated lang is enabled)
     */
    private isAddValueEnabled() {
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
    private isOkEnabled(): boolean {
        return this.values.length > 0 || (this.isInputValid() && this.lang != null);
    }

    ok(event: Event) {
        let labels: ARTLiteral[];
        if (this.context.multiLabelOpt.enabled) {
            if (this.values.length > 0) { //there are multiple values
                labels = this.values;
            } else { //no multiple values => return the input label
                labels = [new ARTLiteral(this.value, null, this.lang)];
            }
        } else {
            labels = [new ARTLiteral(this.value, null, this.lang)];
        }
        var returnedData: NewXLabelModalReturnData = {
            labels: labels,
            cls: this.labelClass
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class NewXLabelModalReturnData {
    labels: ARTLiteral[];
    cls: ARTURIResource;
}