import { Component, Input, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SKOS } from "src/app/models/Vocabulary";
import { ModalType } from 'src/app/widget/modal/Modals';
import { Language, Languages } from "../../models/LanguagesCountries";
import { Project } from "../../models/Project";
import { PrefLabelClashMode, Properties } from "../../models/Properties";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

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

    constructor(private prefService: PreferencesSettingsServices, private vbProperties: VBProperties, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.initSystemLanguages().subscribe(
            () => {
                if (this.project != null) { //if project was already set
                    this.initProjectSettings();
                }
            }
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            if (this.languageItems != null) { //if project changes and system languages already initialized => refresh proj settings
                this.initProjectSettings();
            }
        }
    }

    private initSystemLanguages(): Observable<void> {
        return this.prefService.getDefaultProjectSettings([Properties.setting_languages]).pipe(
            map(stResp => {
                let langsValue = stResp[Properties.setting_languages];
                try {
                    let systemLanguages = <Language[]>JSON.parse(langsValue);
                    Languages.sortLanguages(systemLanguages);
                    this.languageItems = [];
                    for (let i = 0; i < systemLanguages.length; i++) {
                        this.languageItems.push({ lang: systemLanguages[i], active: false });
                    }
                } catch (err) {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.SYS_LANGUAGES_PROP_PARSING_ERR", params: { propName: Properties.setting_languages } }, ModalType.error);
                }
            })
        );
    }

    private initProjectSettings() {
        let properties = [Properties.setting_languages];

        this.isSkos = this.project.getModelType() == SKOS.uri;
        if (this.isSkos) { //in SKOS project init also label clash mode setting
            properties.push(Properties.label_clash_mode);
        }
        this.prefService.getProjectSettings(properties, this.project).subscribe(
            stResp => {
                //init active languages
                let langsValue = stResp[Properties.setting_languages];
                try {
                    let projectLanguages = <Language[]>JSON.parse(langsValue);
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
                } catch (err) {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.PROJ_LANGUAGES_PARSING_ERR", params: { projName: this.project.getName(), propName: Properties.setting_languages } },
                        ModalType.error);
                }
                //init label clash mode
                if (this.isSkos) {
                    if (stResp[Properties.label_clash_mode] != null) {
                        this.labelClashOptSelected = this.labelClashOpts.find(opt => opt.mode == stResp[Properties.label_clash_mode]);
                    } else {
                        this.labelClashOptSelected = this.labelClashOpts.find(opt => opt.mode == PrefLabelClashMode.forbid);
                    }
                }
            }
        );
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
        let activeLangSettingValue = activeLangs.length == 0 ? null : JSON.stringify(activeLangs);
        this.prefService.setProjectSetting(Properties.setting_languages, activeLangSettingValue, this.project).subscribe(
            () => {
                //in case the edited project is the active one, update the settings stored in VBContext
                if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                    if (activeLangSettingValue == null) {
                        /** if no lang is active, reinit the setting because in such case (null activeLangs)
                         * the project languages should be inherit from system setting. */
                        this.vbProperties.initProjectSettings(VBContext.getWorkingProjectCtx()).subscribe();
                    } else {
                        VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting = activeLangs;
                    }
                    
                }
            }
        );
    }

    setLabelClashSetting(opt: LabelClashItem) {
        this.labelClashOptSelected = opt;
        this.prefService.setProjectSetting(Properties.label_clash_mode, this.labelClashOptSelected.mode, this.project).subscribe(
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