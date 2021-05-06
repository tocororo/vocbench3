import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { Language } from "src/app/models/LanguagesCountries";
import { Project } from "src/app/models/Project";
import { ProjectServices } from "src/app/services/projectServices";
import { VBContext } from "src/app/utils/VBContext";

@Component({
    selector: "project-labels-editor-modal",
    templateUrl: "./projectLabelsEditorModal.html",
})
export class ProjectLabelsEditorModal {
    @Input() project: Project;

    labels: LabelItem[];

    pendingLabel: LabelItem;
    pendingLangs: string[]; //languages for which still doesn't exist a label

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices, private translateService: TranslateService) { }

    ngOnInit() {
        this.labels = [];
        let projLabels = this.project.getLabels();
        for (let lang in projLabels) {
            this.labels.push({ lang: lang, label: projLabels[lang] });
        }
        this.updatePendingLangs();
    }

    private updatePendingLangs() {
        this.pendingLangs = VBContext.getSystemSettings().languages
            .filter((l: Language) => !this.labels.some(label => label.lang == l.tag)) //keep only those language not already in labels list
            .map((l: Language) => l.tag) //get only the tag
    }

    addLabel() {
        this.updatePendingLangs();
        let currentLang = this.translateService.currentLang;
        let newLabel = new LabelItem();
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

    removeLabel(label: LabelItem) {
        this.labels.splice(this.labels.indexOf(label), 1);
        this.updatePendingLangs();
    }

    ok() {
        let labelMap: { [lang: string]: string } = {};
        this.labels.forEach(l => {
            labelMap[l.lang] = l.label;
        })
        this.projectService.setProjectLabels(this.project, labelMap).subscribe(
            () => {
                this.project.setLabels(labelMap);
                this.activeModal.close();
            }
        )
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

class LabelItem {
    lang: string;
    label: string;
}