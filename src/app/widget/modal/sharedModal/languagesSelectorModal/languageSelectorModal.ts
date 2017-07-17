import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { PreferencesSettingsServices } from "../../../../services/preferencesSettingsServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { Language, LanguageUtils } from "../../../../models/LanguagesCountries";
import { UIUtils } from "../../../../utils/UIUtils";

export class LanguageSelectorModalData extends BSModalContext {
    /**
     * @param languages languages selected
     */
    constructor(public title: string, public languages: string[] = []) {
        super();
    }
}

@Component({
    selector: "lang-selector-modal",
    templateUrl: "./languageSelectorModal.html",
})
export class LanguageSelectorModal implements ModalComponent<LanguageSelectorModalData> {
    context: LanguageSelectorModalData;

    private languageItems: LanguageItem[];

    constructor(public dialog: DialogRef<LanguageSelectorModalData>, private prefSettingService: PreferencesSettingsServices, 
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.prefSettingService.getSystemLanguages().subscribe(
            stResp => {
                try {
                    var systemLanguages = <Language[]>JSON.parse(stResp);
                    LanguageUtils.sortLanguages(systemLanguages);
                    this.languageItems = [];
                    for (var i = 0; i < systemLanguages.length; i++) {
                        this.languageItems.push({
                            lang: systemLanguages[i], 
                            selected: this.context.languages.indexOf(systemLanguages[i].tag) != -1
                        });
                    }
                } catch (err) {
                    this.basicModals.alert("Error", "Initialization of system languages has encountered a problem during parsing the " +
                        "'languages' property. Please, report this to the system administrator.", "error");
                }
            }
        );
    }

    private getFlagImgSrc(langTag: string): string {
        return UIUtils.getFlagImgSrc(langTag);
    }

    ok(event: Event) {
        var activeLangs: string[] = [];
        for (var i = 0; i < this.languageItems.length; i++) {
            if (this.languageItems[i].selected) {
                activeLangs.push(this.languageItems[i].lang.tag);
            }
        }
        event.stopPropagation();
        this.dialog.close(activeLangs);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

class LanguageItem {
    public lang: Language;
    public selected: boolean;
}