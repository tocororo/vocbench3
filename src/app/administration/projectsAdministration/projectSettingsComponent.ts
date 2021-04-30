import { Component, Input, SimpleChanges } from "@angular/core";
import { ExtensionPointID } from "src/app/models/Plugins";
import { SKOS } from "src/app/models/Vocabulary";
import { SettingsServices } from "src/app/services/settingsServices";
import { Language, Languages } from "../../models/LanguagesCountries";
import { Project } from "../../models/Project";
import { PrefLabelClashMode, SettingsEnum } from "../../models/Properties";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "project-settings",
    templateUrl: "./projectSettingsComponent.html",
})
export class ProjectSettingsComponent {

    @Input() project: Project;
    isSkos: boolean;

    noLangActive: boolean = true;
    languageItems: LanguageItem[];

    labelClashOpts: LabelClashItem[] = [
        { mode: PrefLabelClashMode.allow, modeTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.ALLOW", infoTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.ALLOW_INFO" },
        { mode: PrefLabelClashMode.forbid, modeTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.FORBID", infoTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.FORBID_INFO" },
        { mode: PrefLabelClashMode.warning, modeTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.WARNING", infoTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.WARNING_INFO" }
    ];
    labelClashOptSelected: LabelClashItem;

    constructor(private settingsService: SettingsServices, private vbProperties: VBProperties) { }

    ngOnInit() {
        //init all available system languages
        let systemLanguages: Language[] = Languages.getSystemLanguages()
        this.languageItems = systemLanguages.map(l => {
            return { lang: l, active: false }
        });
        //if project was already set
        if (this.project != null) { 
            this.initProjectSettings();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            if (this.languageItems != null) { //if project changes and system languages already initialized => refresh proj settings
                this.initProjectSettings();
            }
        }
    }

    private initProjectSettings() {
        this.isSkos = this.project.getModelType() == SKOS.uri;
        this.settingsService.getProjectSettings(ExtensionPointID.ST_CORE_ID, this.project).subscribe(
            settings => {
                //init active languages
                let projectLanguages: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                Languages.sortLanguages(projectLanguages);
                for (let i = 0; i < this.languageItems.length; i++) {
                    let idx = Languages.indexOf(projectLanguages, this.languageItems[i].lang);
                    if (idx != -1) {
                        this.languageItems[i].active = true;
                        this.languageItems[i].lang.mandatory = projectLanguages[idx].mandatory;
                        this.noLangActive = false;
                    } else {
                        this.languageItems[i].active = false;
                    }
                }
                //init label clash mode
                if (this.isSkos) {
                    let labelClashMode: string = settings.getPropertyValue(SettingsEnum.labelClashMode);
                    if (labelClashMode != null) {
                        this.labelClashOptSelected = this.labelClashOpts.find(opt => opt.mode == labelClashMode);
                    } else {
                        this.labelClashOptSelected = this.labelClashOpts.find(opt => opt.mode == PrefLabelClashMode.forbid);
                    }
                }
            }
        )
    }

    changeAllLangStatus(checked: boolean) {
        this.languageItems.forEach((item: LanguageItem) => {
            item.active = checked;
            if (!checked) {
                item.lang.mandatory = false;
            }
        });
        this.updateActiveLangSettings();
    }

    private updateActiveLangSettings() {
        let activeLangs: Language[] = [];
        //collects active languages
        this.languageItems.forEach(l => {
            if (l.active) {
                if (!l.lang.mandatory) { //if not mandatory, delete the property so that it is not serialized
                    delete l.lang.mandatory;
                }
                activeLangs.push(l.lang);
            }
        });

        this.noLangActive = activeLangs.length == 0;
        let langSettingValue = (this.noLangActive) ? null : activeLangs;
        this.settingsService.storeProjectSetting(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.languages, langSettingValue).subscribe(
            () => {
                //in case the edited project is the active one, update the settings stored in VBContext
                if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                    if (langSettingValue == null) {
                        /** if no lang is active, reinit the setting because in such case (null activeLangs)
                         * the project languages should be inherit from system setting. */
                        this.vbProperties.initProjectSettings(VBContext.getWorkingProjectCtx()).subscribe();
                    } else {
                        VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting = activeLangs;
                    }
                }
            }
        )
    }

    setLabelClashSetting(opt: LabelClashItem) {
        this.labelClashOptSelected = opt;
        this.settingsService.storeProjectSetting(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.labelClashMode, this.labelClashOptSelected.mode).subscribe(
            () => {
                //in case the edited project is the active one, update the settings stored in VBContext
                if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                    VBContext.getWorkingProjectCtx().getProjectSettings().prefLabelClashMode = this.labelClashOptSelected.mode;
                }
            }
        )
    }

}

interface LanguageItem {
    lang: Language;
    active: boolean;
}

interface LabelClashItem {
    mode: PrefLabelClashMode;
    modeTranslationKey: string;
    infoTranslationKey: string;
}