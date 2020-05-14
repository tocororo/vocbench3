import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTNode } from "../../../models/ARTResources";
import { Language } from "../../../models/LanguagesCountries";

export class CopyLocalesModalData extends BSModalContext {
    constructor(
        public value: ARTNode,
        public locales: Language[]
    ) {
        super();
    }
}

@Component({
    selector: "copy-locale-modal",
    templateUrl: "./copyLocalesModal.html",
})
export class CopyLocalesModal implements ModalComponent<CopyLocalesModalData> {
    context: CopyLocalesModalData;

    private locales: { locale: Language; checked: boolean; }[] = [];

    constructor(public dialog: DialogRef<CopyLocalesModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.context.locales.forEach(l => {
            this.locales.push({ locale: l, checked: true });
        });
    }

    /**
     * Ok disabled if none of the locales is checked
     */
    private isOkDisabled() {
        for (let i = 0; i < this.locales.length; i++) {
            if (this.locales[i].checked) return false;
        }
        return true;
    }

    ok(event: Event) {
        let returnData: Language[] = [];
        this.locales.forEach(l => {
            if (l.checked) {
                returnData.push(l.locale);
            }
        });
        this.dialog.close(returnData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}
