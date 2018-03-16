import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ARTLiteral, ARTURIResource } from "../../../../../models/ARTResources";
import { SKOSXL } from "../../../../../models/Vocabulary";
import { BrowsingModalServices } from "../../../browsingModal/browsingModalServices";

export class NewXLabelModalData extends BSModalContext {
    /**
     * @param title the title of the modal dialog
     * @param value the value inserted by default
     * @param valueReadonly if true the input field is disable and cannot be changed
     * @param lang the language selected by default
     * @param langReadonly if true the language selection is disable and language cannot be changed
     */
    constructor(
        public title: string = 'Create new label',
        public value: string,
        public valueReadonly: boolean = false,
        public lang: string,
        public langReadonly: boolean = false,
        public clsChangeable: boolean = true
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

    private value: string;
    private lang: string;

    private labelClass: ARTURIResource = SKOSXL.label;

    constructor(public dialog: DialogRef<NewXLabelModalData>, private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
        this.value = this.context.value;
        document.getElementById("toFocus").focus();
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            if (!event.shiftKey && !event.altKey && !event.ctrlKey) {
                if (this.isInputValid()) {
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

    private onLangChange(newLang: string) {
        setTimeout(() => {
            this.lang = newLang;
        });
    }

    private isInputValid(): boolean {
        return (this.value != undefined && this.value.trim() != "");
    }

    ok(event: Event) {
        var returnedData: { label: ARTLiteral, cls: ARTURIResource } = {
            label: new ARTLiteral(this.value, null, this.lang),
            cls: this.labelClass
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}