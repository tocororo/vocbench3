import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { Language } from "src/app/models/LanguagesCountries";
import { VBContext } from 'src/app/utils/VBContext';

@Component({
    selector: "localized-editor-modal",
    templateUrl: "./localizedEditorModal.html",
})
export class LocalizedEditorModal {

    @Input() title: string;
    @Input() localizedMap: LocalizedMap;
    @Input() allowEmpty: boolean;

    labels: LocalizedItem[];

    pendingLabel: LocalizedItem;
    pendingLangs: string[]; //languages for which still doesn't exist a label

    constructor(public activeModal: NgbActiveModal, private translateService: TranslateService) { }

    ngOnInit() {
        this.labels = [];
        for (let lang in this.localizedMap) {
            let l: LocalizedItem = new LocalizedItem();
            l.lang = lang;
            l.label = this.localizedMap[lang];
            this.labels.push(l);
        }

        this.updatePendingLangs();
    }

    private updatePendingLangs() {
        this.pendingLangs = VBContext.getSystemSettings().languages
            .filter((l: Language) => !this.labels.some(label => label.lang == l.tag)) //keep only those language not already in labels list
            .map((l: Language) => l.tag); //get only the tag
    }

    addLabel() {
        this.updatePendingLangs();
        let currentLang = this.translateService.currentLang;
        let newLabel = new LocalizedItem();
        if (this.pendingLangs.includes(currentLang)) { //current i18n language not yet in labels list => use it for new label
            newLabel.lang = currentLang;
        }
        this.pendingLabel = newLabel;
    }

    isNewLabelOk(): boolean {
        //label cannot be added if incomplete or if language is already used
        if (this.pendingLabel.label == null || this.pendingLabel.label.trim() == "" || this.pendingLabel.lang == null) {
            return false;
        }
        if (this.labels.some(l => l.lang == this.pendingLabel.lang)) {
            return false;
        }
        return true;
    }

    confirmNewLabel() {
        this.labels.push(this.pendingLabel);
        this.pendingLabel = null;
    }

    removeLabel(label: LocalizedItem) {
        this.labels.splice(this.labels.indexOf(label), 1);
        this.updatePendingLangs();
    }

    isOkEnabled() {
        if (this.allowEmpty) {
            return true;
        } else {
            return this.labels.length > 0;
        }
    }

    ok() {
        let labelMap: { [lang: string]: string } = {};
        this.labels.forEach(l => {
            labelMap[l.lang] = l.label;
        });
        this.activeModal.close(labelMap);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export class LocalizedMap {
    [lang: string]: string;
}

class LocalizedItem {
    lang: string;
    label: string;
}