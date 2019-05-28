import { Component, Input, SimpleChanges } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { Project } from "../../models/Project";
import { Properties } from "../../models/Properties";
import { Language, Languages } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";
import { VBProperties } from "../../utils/VBProperties";
import { VBContext } from "../../utils/VBContext";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";

@Component({
    selector: "project-settings",
    templateUrl: "./projectSettingsComponent.html",
})
export class ProjectSettingsComponent {

    @Input() project: Project;

    private noLangActive: boolean = true;

    private languageItems: LanguageItem[];

    constructor(private prefSetService: PreferencesSettingsServices, private vbProperties: VBProperties, private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        //initialize the languageItems with the system languages
        if (this.languageItems == null) {
            this.prefSetService.getDefaultProjectSettings([Properties.setting_languages]).subscribe(
                stResp => {
                    var langsValue = stResp[Properties.setting_languages];
                    try {
                        var systemLanguages = <Language[]>JSON.parse(langsValue);
                        Languages.sortLanguages(systemLanguages);
                        this.languageItems = [];
                        for (var i = 0; i < systemLanguages.length; i++) {
                            this.languageItems.push({ lang: systemLanguages[i], active: false });
                        }

                        //in case the project is already set, init the 'active' statuses
                        if (changes['project'] && changes['project'].currentValue) {
                            this.updateActiveLanguages();
                        }
                    } catch (err) {
                        this.basicModals.alert("Error", "Initialization of system languages has encountered a problem during parsing the " +
                            "'" + Properties.setting_languages + "' property. Please, report this to the system administrator.", "error");
                    }
                }
            );
        } else if (changes['project'] && changes['project'].currentValue) {
            //init the 'active' statuses
            this.updateActiveLanguages();
        }
    }

    private updateActiveLanguages() {
        this.prefSetService.getProjectSettings([Properties.setting_languages], this.project).subscribe(
            stResp => {
                var langsValue = stResp[Properties.setting_languages];
                try {
                    var projectLanguages = <Language[]>JSON.parse(langsValue);
                    Languages.sortLanguages(projectLanguages);
                    for (var i = 0; i < this.languageItems.length; i++) {
                        let idx = Languages.indexOf(projectLanguages, this.languageItems[i].lang);
                        if (idx != -1) {
                            this.languageItems[i].active = true;
                            this.languageItems[i].lang.mandatory = projectLanguages[idx].mandatory;
                            this.noLangActive = false;
                        } else {
                            this.languageItems[i].active = false;
                        }
                    }
                } catch (err) {
                    this.basicModals.alert("Error", "Initialization of languages for project '" + this.project.getName() + 
                        "' has encountered a problem during parsing the '" + Properties.setting_languages + "' settings. " + 
                        "Please, report this to the system administrator.", "error");
                }
            }
        );
    }

    private changeAllLangStatus(checked: boolean) {
        this.languageItems.forEach((item: LanguageItem) => {
            item.active = checked;
            if (!checked) {
                item.lang.mandatory = false;
            }
        });
        this.updateSettings();
    }

    private updateSettings() {
        var activeLangs: Language[] = [];
        //collects active languages
        for (var i = 0; i < this.languageItems.length; i++) {
            if (this.languageItems[i].active) {
                activeLangs.push(this.languageItems[i].lang);
                if (!this.languageItems[i].lang.mandatory) {
                    delete this.languageItems[i].lang.mandatory; //if not mandatory, delete the property so that it is not serialized
                }
            }
        }
        if (activeLangs.length == 0) { //if no language is active, set null as value, so the setting is removed
            this.noLangActive = true;
            this.prefSetService.setProjectSetting(Properties.setting_languages, null, this.project).subscribe(
                stResp => {
                    /** Reinit the project setting because it cannot set activeLangs as projectLanguages
                     * since being empty the project languages should be inherit from system setting.
                     * This operation is performed only if the current open project is the working one. */
                    if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                        this.vbProperties.initProjectSettings();
                    }
                }
            );
        } else {
            this.noLangActive = false;
            this.prefSetService.setProjectSetting(Properties.setting_languages, JSON.stringify(activeLangs), this.project).subscribe(
                stResp => {
                    VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting = activeLangs;
                }
            );
        }
    }

}

class LanguageItem {
    public lang: Language;
    public active: boolean;
}