import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTNode } from "../../../models/ARTResources";
import { Language } from "../../../models/LanguagesCountries";

@Component({
    selector: "copy-locale-modal",
    templateUrl: "./copyLocalesModal.html",
})
export class CopyLocalesModal {
    @Input() value: ARTNode;
    @Input() localesInput: Language[];

    locales: { locale: Language; checked: boolean; }[] = [];

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.localesInput.forEach(l => {
            this.locales.push({ locale: l, checked: true });
        });
    }

    /**
     * Ok disabled if none of the locales is checked
     */
    isOkDisabled() {
        for (let i = 0; i < this.locales.length; i++) {
            if (this.locales[i].checked) return false;
        }
        return true;
    }

    ok() {
        let returnData: Language[] = [];
        this.locales.forEach(l => {
            if (l.checked) {
                returnData.push(l.locale);
            }
        });
        this.activeModal.close(returnData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}
