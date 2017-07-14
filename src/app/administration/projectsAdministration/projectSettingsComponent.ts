import { Component, Input, SimpleChanges } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { Project } from "../../models/Project";
import { Language, LanguageUtils } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";

@Component({
    selector: "project-settings",
    templateUrl: "./projectSettingsComponent.html",
})
export class ProjectSettingsComponent {

    @Input() project: Project;

    private languagesSettingName = "languages";
    private noLangActive: boolean = true;

    private languageItems: LanguageItem[];

    constructor(private prefSetService: PreferencesSettingsServices, private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        //initialize the languageItems with the system languages
        if (this.languageItems == null) {
            this.prefSetService.getDefaultProjectSettings([this.languagesSettingName]).subscribe(
                stResp => {
                    var langsValue = stResp[this.languagesSettingName];
                    try {
                        var systemLanguages = <Language[]>JSON.parse(langsValue);
                        LanguageUtils.sortLanguages(systemLanguages);
                        this.languageItems = [];
                        for (var i = 0; i < systemLanguages.length; i++) {
                            this.languageItems.push({ lang: systemLanguages[i], active: false });
                        }

                        //in case the project is already set init the 'active' statuses
                        if (changes['project'] && changes['project'].currentValue) {
                            this.updateActiveLanguages();
                        }
                    } catch (err) {
                        this.basicModals.alert("Error", "Initialization of system languages has encountered a problem during parsing the " +
                            "'" + this.languagesSettingName + "' property. Please, report this to the system administrator.", "error");
                    }
                }
            );
        } else if (changes['project'] && changes['project'].currentValue) {
            //init the 'active' statuses
            this.updateActiveLanguages();
        }
    }

    private updateActiveLanguages() {
        this.prefSetService.getProjectSettings([this.languagesSettingName], this.project).subscribe(
            stResp => {
                var langsValue = stResp[this.languagesSettingName];
                try {
                    var projectLanguages = <Language[]>JSON.parse(langsValue);
                    LanguageUtils.sortLanguages(projectLanguages);
                    for (var i = 0; i < this.languageItems.length; i++) {
                        if (LanguageUtils.containsLanguage(projectLanguages, this.languageItems[i].lang)) {
                            this.languageItems[i].active = true;
                            this.noLangActive = false;
                        } else {
                            this.languageItems[i].active = false;
                        }
                    }
                } catch (err) {
                    this.basicModals.alert("Error", "Initialization of languages for project '" + this.project.getName() + 
                        "' has encountered a problem during parsing the '" + this.languagesSettingName + "' settings. " + 
                        "Please, report this to the system administrator.", "error");
                }
            }
        );
    }

    private changeAllLangStatus(checked: boolean) {
        this.languageItems.forEach((item: LanguageItem) => {
            item.active = checked;
        });
        this.updateSettings();
    }

    private updateSettings() {
        var activeLangs: Language[] = [];
        //collects active languages
        for (var i = 0; i < this.languageItems.length; i++) {
            if (this.languageItems[i].active) {
                activeLangs.push(this.languageItems[i].lang);
            }
        }
        if (activeLangs.length == 0) { //if no language is active, set null as value, so the setting is removed
            this.noLangActive = true;
            this.prefSetService.setProjectSetting(this.languagesSettingName, null, this.project).subscribe();
        } else {
            this.noLangActive = false;
            this.prefSetService.setProjectSetting(this.languagesSettingName, JSON.stringify(activeLangs), this.project).subscribe();
        }
    }

    private getFlagImgSrc(langTag: string): string {
        return UIUtils.getFlagImgSrc(langTag);
    }

}

class LanguageItem {
    public lang: Language;
    public active: boolean;
}