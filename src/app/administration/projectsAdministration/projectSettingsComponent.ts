import { Component, Input, SimpleChanges } from "@angular/core";
import { from, Observable, of } from 'rxjs';
import { ExtensionPointID, Scope, Settings } from "src/app/models/Plugins";
import { EDOAL, SKOS } from "src/app/models/Vocabulary";
import { SettingsServices } from "src/app/services/settingsServices";
import { VBEventHandler } from 'src/app/utils/VBEventHandler';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { Language, Languages } from "../../models/LanguagesCountries";
import { Project } from "../../models/Project";
import { CustomTreeRootSelection, CustomTreeSettings, PrefLabelClashMode, ResourceViewProjectSettings, SettingsEnum } from "../../models/Properties";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "project-settings",
    templateUrl: "./projectSettingsComponent.html",
})
export class ProjectSettingsComponent {

    @Input() project: Project;

    isSkos: boolean;
    isEdoal: boolean;

    activeSetting: "languages" | "resView" | "other" = "languages";

    langCollapsed: boolean = false;
    labelClashCollapsed: boolean = true;

    //Lang
    noLangActive: boolean = true;
    languageItems: LanguageItem[];

    //label clash
    labelClashOpts: LabelClashItem[] = [
        { mode: PrefLabelClashMode.allow, modeTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.ALLOW", infoTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.ALLOW_INFO" },
        { mode: PrefLabelClashMode.forbid, modeTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.FORBID", infoTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.FORBID_INFO" },
        { mode: PrefLabelClashMode.warning, modeTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.WARNING", infoTranslationKey: "ADMINISTRATION.PROJECTS.PREF_LABEL_CLASH.WARNING_INFO" }
    ];
    labelClashOptSelected: LabelClashItem;

    //res view
    rvSettings: ResourceViewProjectSettings;

    //custom tree
    customTreeSettings: CustomTreeSettings;

    //time machine
    historyEnabled: boolean; //show the option for time machine only if the project has history
    timeMachineEnabled: boolean;

    constructor(private settingsService: SettingsServices, private vbProp: VBProperties, private basicModals: BasicModalServices, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        //init all available system languages
        let systemLanguages: Language[] = VBContext.getSystemSettings().languages;
        this.languageItems = systemLanguages.map(l => {
            return { lang: l, active: false };
        });
        //if project was already set
        if (this.project != null) {
            this.initProjectSettings();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            this.isSkos = this.project.getModelType() == SKOS.uri;
            this.isEdoal = this.project.getModelType() == EDOAL.uri;
            this.historyEnabled = this.project.isHistoryEnabled();
            //currently the only setting in the "other" tab is the one related to the skos(xl) label clash, so if project is not skos reset the tab to languages
            if (!this.isSkos && this.activeSetting == "other") {
                this.activeSetting = "languages";
            }

            if (this.languageItems != null) { //if project changes and system languages already initialized => refresh proj settings
                this.initProjectSettings();
            }
        }
    }

    private initProjectSettings() {
        this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, this.project).subscribe(
            settings => {
                //init active languages
                this.initLanguageSettings(settings);
                //init ResView settings
                this.initResViewSettings(settings);
                //init label clash mode
                this.initLabelClashSetting(settings);
                //time machine
                this.initTimeMachineSetting(settings);
            }
        );
        this.settingsService.getPUSettingsProjectDefault(ExtensionPointID.ST_CORE_ID, this.project).subscribe(
            settings => {
                this.initCustomTreeSettings(settings);
            }
        );
    }

    /* =====================
     * LANGUAGES
     * ===================== */

    private initLanguageSettings(settings: Settings) {
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

        this.settingsService.storeSettingForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, SettingsEnum.languages, langSettingValue, this.project).subscribe(
            () => {
                //in case the edited project is the active one, update the settings stored in VBContext
                if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                    if (langSettingValue == null) {
                        /** if no lang is active, reinit the setting because in such case (null activeLangs)
                         * the project languages should be inherit from system setting. */
                        this.vbProp.initProjectSettings(VBContext.getWorkingProjectCtx()).subscribe();
                    } else {
                        VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting = activeLangs;
                    }
                }
            }
        );
    }

    /* =====================
     * RES VIEW TEMPLATE
     * ===================== */

    private initResViewSettings(settings: Settings) {
        this.rvSettings = settings.getPropertyValue(SettingsEnum.resourceView);
    }

    /* =====================
     * OTHER
     * ===================== */

    //label clash

    initLabelClashSetting(settings: Settings) {
        if (this.isSkos) {
            let labelClashMode: string = settings.getPropertyValue(SettingsEnum.labelClashMode);
            if (labelClashMode != null) {
                this.labelClashOptSelected = this.labelClashOpts.find(opt => opt.mode == labelClashMode);
            } else {
                this.labelClashOptSelected = this.labelClashOpts.find(opt => opt.mode == PrefLabelClashMode.forbid);
            }
        }
    }

    setLabelClashSetting(opt: LabelClashItem) {
        this.labelClashOptSelected = opt;
        this.settingsService.storeSettingForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, SettingsEnum.labelClashMode, this.labelClashOptSelected.mode, this.project).subscribe(
            () => {
                //in case the edited project is the active one, update the settings stored in VBContext
                if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                    VBContext.getWorkingProjectCtx().getProjectSettings().prefLabelClashMode = this.labelClashOptSelected.mode;
                }
            }
        );
    }

    //custom tree

    initCustomTreeSettings(settings: Settings) {
        if (!this.isEdoal) {
            this.customTreeSettings = settings.getPropertyValue(SettingsEnum.customTree);
        }
    }

    onCustomTreeSettingsSubmit() {
        this.isCustomTreeSettingsValid().subscribe(
            valid => {
                this.submitCustomTreeSettings();
            }
        );
    }

    private isCustomTreeSettingsValid(): Observable<boolean> {
        if (this.customTreeSettings.enabled) {
            //check if CTree enabled but incomplete (hierarchical prop not provided, or root selection set to enumeration but no roots provided)
            if (
                (this.customTreeSettings.hierarchicalProperty == null) ||
                (this.customTreeSettings.rootSelection == CustomTreeRootSelection.enumeration && (!this.customTreeSettings.roots || this.customTreeSettings.roots.length == 0))
            ) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "DATA.CUSTOM_TREE.MESSAGES.INCOMPLETE_CONFIGURATION" }, ModalType.warning);
                return of(false);
            }
            //check if resource type is not provided (default to rdfs:Resource) and root selection set to all
            if (this.customTreeSettings.type == null && this.customTreeSettings.rootSelection == CustomTreeRootSelection.all) {
                return from(
                    this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "DATA.CUSTOM_TREE.MESSAGES.NO_TYPE_ALL_ROOTS_WARN" }, ModalType.warning).then(
                        () => {
                            return true;
                        },
                        () => {
                            return false;
                        }
                    )
                );
            } else {
                return of(true);
            }
        } else {
            return of(true);
        }
    }

    private submitCustomTreeSettings() {
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.customTree, this.customTreeSettings).subscribe(
            () => {
                this.checkAndUpdateCurrentProjectCustomTreeSettings();
            }
        );
    }

    onCustomTreeSettingsReset() {
        this.customTreeSettings = { type: null, hierarchicalProperty: null };
    }

    /**
     * Check if the changes have been done on the current accessed project. In such case, update the settings cached in VBContext
     */
    private checkAndUpdateCurrentProjectCustomTreeSettings() {
        //in case the edited project is the active one, update the settings stored in VBContext
        if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
            //update the settings getting them from server in order to exploit the fallback-to-default mechanism
            this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER).subscribe(
                settings => {
                    VBContext.getWorkingProjectCtx().getProjectPreferences().customTreeSettings = settings.getPropertyValue(SettingsEnum.customTree);
                    this.eventHandler.customTreeSettingsChangedEvent.emit();
                }
            );
        }
    }

    //time machine

    initTimeMachineSetting(settings: Settings) {
        if (this.historyEnabled) {
            this.timeMachineEnabled = settings.getPropertyValue(SettingsEnum.timeMachineEnabled);
        }
    }

    onTimeMachineEnabledChanged() {
        this.settingsService.storeSettingForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, SettingsEnum.timeMachineEnabled, this.timeMachineEnabled, this.project).subscribe(
            () => {
                //in case the edited project is the active one, update the settings stored in VBContext
                if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                    VBContext.getWorkingProjectCtx().getProjectSettings().timeMachineEnabled = this.timeMachineEnabled;
                }
            }
        );
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