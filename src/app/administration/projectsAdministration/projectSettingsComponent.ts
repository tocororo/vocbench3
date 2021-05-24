import { Component, Input, SimpleChanges } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { ExtensionPointID, Scope, Settings } from "src/app/models/Plugins";
import { ResViewPartition } from "src/app/models/ResourceView";
import { SKOS } from "src/app/models/Vocabulary";
import { SettingsServices } from "src/app/services/settingsServices";
import { Language, Languages } from "../../models/LanguagesCountries";
import { Project } from "../../models/Project";
import { PrefLabelClashMode, ResourceViewProjectSettings, SettingsEnum, CustomSection } from "../../models/Properties";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "project-settings",
    templateUrl: "./projectSettingsComponent.html",
})
export class ProjectSettingsComponent {

    @Input() project: Project;
    isSkos: boolean;

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
    customSections: { id: ResViewPartition, properties: ARTURIResource[] }[];
    templates: {[key: string]: { enabled: ResViewPartition[], disabled: ResViewPartition[] }} = {}; //for each role list of enabled and disabled partitions

    roles: RDFResourceRolesEnum[];
    selectedRole: RDFResourceRolesEnum;

    selectedEnabledPartition: ResViewPartition;
    selectedDisabledPartition: ResViewPartition;

    private rvSettingTimer: number; //in order to do not fire too much close requests to update rv settings

    constructor(private settingsService: SettingsServices, private vbProperties: VBProperties) { }

    ngOnInit() {
        //init all available system languages
        let systemLanguages: Language[] = VBContext.getSystemSettings().languages;
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
        this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, this.project).subscribe(
            settings => {
                //init active languages
                this.initLanguageSettings(settings);
                //init ResView settings
                this.initResViewSettings(settings);
                //init label clash mode
                this.initLabelClashSetting(settings);
            }
        )
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
                        this.vbProperties.initProjectSettings(VBContext.getWorkingProjectCtx()).subscribe();
                    } else {
                        VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting = activeLangs;
                    }
                }
            }
        )
    }

    /* =====================
     * RES VIEW TEMPLATE
     * ===================== */

    private initResViewSettings(settings: Settings) {
        let rvSettings = settings.getPropertyValue(SettingsEnum.resourceView);
        this.customSections = [];
        if (rvSettings.customSections != null) {
            for (let partitionId in rvSettings.customSections) {
                let cs: CustomSection = rvSettings.customSections[partitionId];
                let matchedProperties: ARTURIResource[] = cs.matchedProperties.map(p => new ARTURIResource(p));
                this.customSections.push({ id: <ResViewPartition>partitionId, properties: matchedProperties});
            }
        }

        //collects all the partition
        let allPartitions: ResViewPartition[] = [];
        for (let p in ResViewPartition) { //the built-in
            allPartitions.push(<ResViewPartition>p);
        }
        this.customSections.forEach(cs => allPartitions.push(cs.id)); //the custom ones
        allPartitions.sort();
        //init the template
        this.templates = {};
        if (rvSettings.templates != null) {
            for (let role in rvSettings.templates) {
                let activePartitions: ResViewPartition[] = rvSettings.templates[role];
                let notActivePartitions: ResViewPartition[] = allPartitions.filter(p => !activePartitions.includes(p));
                this.templates[role] = { enabled: activePartitions, disabled: notActivePartitions };
            }
        }
        this.roles = <RDFResourceRolesEnum[]>Object.keys(this.templates);
    }

    selectRole(role: RDFResourceRolesEnum) {
        this.selectedRole = role;
        this.selectedEnabledPartition = null;
        this.selectedDisabledPartition = null;
    }

    selectPartition(partition: ResViewPartition, enabled: boolean) {
        if (enabled) {
            this.selectedEnabledPartition = partition;
            this.selectedDisabledPartition = null;
        } else {
            this.selectedEnabledPartition = null;
            this.selectedDisabledPartition = partition;
        }
    }

    enablePartition(role: RDFResourceRolesEnum) {
        this.templates[role].enabled.push(this.selectedDisabledPartition);
        this.templates[role].disabled.splice(this.templates[role].disabled.indexOf(this.selectedDisabledPartition), 1);
        this.selectedDisabledPartition = null;
        this.updateResViewSettingsWithTimeout();
    }
    disablePartition(role: RDFResourceRolesEnum) {
        this.templates[role].disabled.push(this.selectedEnabledPartition);
        this.templates[role].enabled.splice(this.templates[role].enabled.indexOf(this.selectedEnabledPartition), 1);
        this.templates[role].disabled.sort();
        this.selectedEnabledPartition = null;
        this.updateResViewSettingsWithTimeout();
    }

    movePartitionUp(role: RDFResourceRolesEnum) {
        let idx = this.templates[role].enabled.indexOf(this.selectedEnabledPartition);
        if (idx > 0) {
            let oldP = this.templates[role].enabled[idx-1];
            this.templates[role].enabled[idx-1] = this.selectedEnabledPartition;
            this.templates[role].enabled[idx] = oldP;
        }
        this.updateResViewSettingsWithTimeout();
    }
    movePartitionDown(role: RDFResourceRolesEnum) {
        let idx = this.templates[role].enabled.indexOf(this.selectedEnabledPartition);
        if (idx < this.templates[role].enabled.length-1) {
            let oldP = this.templates[role].enabled[idx+1];
            this.templates[role].enabled[idx+1] = this.selectedEnabledPartition;
            this.templates[role].enabled[idx] = oldP;
        }
        this.updateResViewSettingsWithTimeout();
    }

    updateResViewSettingsWithTimeout() {
        clearTimeout(this.rvSettingTimer);
        this.rvSettingTimer = window.setTimeout(() => { this.updateResViewSettings() }, 1000);
    }
    

    private updateResViewSettings() {
        let customSections: {[key: string]: CustomSection} = {}; //map name -> CustomSection
        this.customSections.forEach(cs => {
            customSections[cs.id] = {
                matchedProperties: cs.properties.map(p => p.toNT())
            }
        })

        let templates: {[key: string]: ResViewPartition[]} = {}; //map role -> sections
        for (let role in this.templates) {
            templates[role] = this.templates[role].enabled;
        }

        let rvSettings: ResourceViewProjectSettings = {
            customSections: customSections,
            templates: templates
        };
        console.log("store", rvSettings);
        this.settingsService.storeSettingForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, SettingsEnum.resourceView, rvSettings, this.project).subscribe(
            () => {
                //in case the edited project is the active one, update the settings stored in VBContext
                if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                    VBContext.getWorkingProjectCtx().getProjectSettings().resourceView = rvSettings;
                }
            }
        )
    }

    /* =====================
     * OTHER
     * ===================== */

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