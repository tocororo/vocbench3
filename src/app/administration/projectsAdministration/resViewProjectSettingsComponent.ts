import { Component, Input, SimpleChanges } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { ExtensionPointID, Scope } from "src/app/models/Plugins";
import { ResViewPartition } from "src/app/models/ResourceView";
import { SettingsServices } from "src/app/services/settingsServices";
import { NTriplesUtil, ResourceUtils } from "src/app/utils/ResourceUtils";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { ModalType } from "src/app/widget/modal/Modals";
import { Project } from "../../models/Project";
import { CustomSection, ResourceViewProjectSettings, SettingsEnum } from "../../models/Properties";
import { VBContext } from "../../utils/VBContext";

@Component({
    selector: "res-view-project-settings",
    templateUrl: "./resViewProjectSettingsComponent.html",
    host: { class: "vbox" }
})
export class ResViewProjectSettingsComponent {

    @Input() project: Project;
    @Input('settings') rvSettings: ResourceViewProjectSettings;

    isAdmin: boolean; //useful to decide which store/restore defualt action allow
    isActiveProject: boolean; //useful to decide if allow properties addition through properties tree or manually

    //templates
    templates: {[key: string]: { enabled: ResViewPartition[], disabled: ResViewPartition[] }} = {}; //for each role list of enabled and disabled partitions

    roles: RDFResourceRolesEnum[];
    selectedRole: RDFResourceRolesEnum;

    selectedEnabledPartition: ResViewPartition;
    selectedDisabledPartition: ResViewPartition;

    private rvSettingTimer: number; //in order to do not fire too much close requests to update rv settings

    //custom sections
    customSections: {[key: string]: ARTURIResource[]}; //ResViewPartition -> properties
    customSectionsIDs: string[];

    selectedCustomSection: string;
    selectedManagedProperty: ARTURIResource;

    constructor(private settingsService: SettingsServices, private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) { }

    ngOnInit() {
        this.isAdmin = VBContext.getLoggedUser().isAdmin();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rvSettings'] && changes['rvSettings'].currentValue) {
            this.initResViewSettings();
        }
        if (changes['project'] && changes['project'].currentValue) {
            let workingProj = VBContext.getWorkingProject();
            this.isActiveProject = workingProj != null && workingProj.getName() == this.project.getName();
        }
    }

    private initResViewSettings() {
        this.templates = {};
        this.selectedRole = null;
        this.selectedEnabledPartition = null;
        this.selectedDisabledPartition = null;

        this.customSections = {};
        this.customSectionsIDs = [];
        this.selectedCustomSection = null;
        this.selectedManagedProperty = null;

        if (this.rvSettings.customSections != null) {
            for (let partitionId in this.rvSettings.customSections) {
                let cs: CustomSection = this.rvSettings.customSections[partitionId];
                let matchedProperties: ARTURIResource[] = cs.matchedProperties.map(p => new ARTURIResource(p));
                matchedProperties.sort((p1, p2) => p1.getURI().localeCompare(p2.getURI()));
                this.customSections[partitionId] = matchedProperties;
            }
        }
        this.customSectionsIDs = Object.keys(this.customSections);

        //collects all the partition
        let allPartitions: ResViewPartition[] = [];
        for (let p in ResViewPartition) { //the built-in
            allPartitions.push(<ResViewPartition>p);
        }
        this.customSectionsIDs.forEach(cs => allPartitions.push(<ResViewPartition>cs)); //the custom ones
        allPartitions.sort();
        //init the template
        if (this.rvSettings.templates != null) {
            for (let role in this.rvSettings.templates) {
                let activePartitions: ResViewPartition[] = this.rvSettings.templates[role];
                let notActivePartitions: ResViewPartition[] = allPartitions.filter(p => !activePartitions.includes(p));
                this.templates[role] = { enabled: activePartitions, disabled: notActivePartitions };
            }
        }
        this.roles = <RDFResourceRolesEnum[]>Object.keys(this.templates).sort();
    }

    /* ================
    * TEMPLATE
    * ================= */

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

    /* ================
    * CUSTOM SECTIONS
    * ================= */

    selectCustomSection(cs: string) {
        this.selectedCustomSection = cs;
        this.selectedManagedProperty = null;
    }

    renameCustomSection() {
        this.basicModals.prompt({key:"ADMINISTRATION.PROJECTS.RES_VIEW.RENAME_CUSTOM_SECTION"}, null, null, this.selectedCustomSection).then(
            sectionName => {
                let newSectionName: ResViewPartition = <ResViewPartition> sectionName;
                if (newSectionName == this.selectedCustomSection) { //not changed
                    return;
                }
                if (Object.keys(this.templates).includes(newSectionName)) { //changed but section with the same name already exists
                    this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.ALREADY_EXISTING_SECTION"}, ModalType.warning);
                    return;
                }
                //move the managed properties to the new section, then remove the old one
                let props: ARTURIResource[] = this.customSections[this.selectedCustomSection];
                this.customSections[newSectionName] = props;
                delete this.customSections[this.selectedCustomSection];
                this.customSectionsIDs = Object.keys(this.customSections);
                
                //rename the custom section also in the template
                for (let role in this.templates) {
                    //check if it is among the enabled
                    this.templates[role].enabled.forEach((section, index, list) => {
                        if (section == this.selectedCustomSection) {
                            list[index] = newSectionName;
                        }
                    })
                    //check if it is among the disabled
                    this.templates[role].disabled.forEach((section, index, list) => {
                        if (section == this.selectedCustomSection) {
                            list[index] = newSectionName;
                        }
                    })
                }

                //update the selections
                this.selectedEnabledPartition = (this.selectedEnabledPartition == this.selectedCustomSection) ? newSectionName : null;
                this.selectedDisabledPartition = (this.selectedDisabledPartition == this.selectedCustomSection) ? newSectionName : null;
                this.selectedCustomSection = newSectionName;
                this.updateResViewSettings();
            },
            () => {}
        )
    }

    addCustomSection() {
        this.basicModals.prompt({key:"ADMINISTRATION.PROJECTS.RES_VIEW.CREATE_CUSTOM_SECTION"}).then(
            customSectionName => {
                if (Object.keys(this.templates).includes(customSectionName)) { //section with the same name already exists
                    this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.ALREADY_EXISTING_SECTION"}, ModalType.warning);
                    return;
                }
                this.customSections[customSectionName] = [];
                this.customSectionsIDs = Object.keys(this.customSections);
                //add the new section to those disabled in the templates
                for (let role in this.templates) {
                    this.templates[role].disabled.push(<ResViewPartition>customSectionName);
                    this.templates[role].disabled.sort();
                }
                this.updateResViewSettings();
            },
            () => {}
        )
    }

    deleteCustomSection() {
        delete this.customSections[this.selectedCustomSection];
        this.customSectionsIDs = Object.keys(this.customSections); //update the IDs list
        //remove the custom section from the templates
        for (let role in this.templates) {
            //check if it is among the enabled
            if (this.templates[role].enabled.some(s => s == this.selectedCustomSection)) {
                this.templates[role].enabled.splice(this.templates[role].enabled.indexOf(<ResViewPartition>this.selectedCustomSection), 1);
                if (this.selectedEnabledPartition == this.selectedCustomSection) {
                    this.selectedEnabledPartition = null;
                }
            }
            //check if it is among the disabled
            if (this.templates[role].disabled.some(s => s == this.selectedCustomSection)) {
                this.templates[role].disabled.splice(this.templates[role].disabled.indexOf(<ResViewPartition>this.selectedCustomSection), 1);
                if (this.selectedDisabledPartition == this.selectedCustomSection) {
                    this.selectedDisabledPartition = null;
                }
            }
        }
        this.selectedCustomSection = null;
        this.updateResViewSettings();
    }

    selectManagedProperty(prop: ARTURIResource) {
        this.selectedManagedProperty = prop;
    }

    addManagedProperty() {
        if (this.isActiveProject) {
            this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}).then(
                (prop: ARTURIResource) => {
                    if (!this.customSections[this.selectedCustomSection].some(p => p.equals(prop))) { //if not already in
                        this.customSections[this.selectedCustomSection].push(prop);
                        this.updateResViewSettings();
                    }
                },
                () => {}
            )
        } else {
            this.basicModals.prompt({key:"DATA.ACTIONS.ADD_PROPERTY"}, {value: "IRI"}).then(
                valueIRI => {
                    let prop: ARTURIResource;
                    if (ResourceUtils.testIRI(valueIRI)) { //valid iri (e.g. "http://test")
                        prop = new ARTURIResource(valueIRI);
                    } else { //not an IRI, try to parse as NTriples
                        try {
                            prop = NTriplesUtil.parseURI(valueIRI)
                        } catch (error) { //neither a valid ntriple iri (e.g. "<http://test>")
                            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_IRI", params:{iri: valueIRI}}, ModalType.warning);
                            return;
                        }
                    }
                    if (!this.customSections[this.selectedCustomSection].some(p => p.equals(prop))) { //if not already in
                        this.customSections[this.selectedCustomSection].push(prop);
                        this.updateResViewSettings();
                    }
                },
                () => {}
            )
        }
    }

    deleteManagedProperty() {
        this.customSections[this.selectedCustomSection].splice(this.customSections[this.selectedCustomSection].indexOf(this.selectedManagedProperty), 1);
        this.selectedManagedProperty = null;
        this.updateResViewSettings();
    }

    //================

    /**
     * Store the settings only after a timeout of 1000 in order to prevent too much service invocation
     * when user is editing the templates
     */
    updateResViewSettingsWithTimeout() {
        clearTimeout(this.rvSettingTimer);
        this.rvSettingTimer = window.setTimeout(() => { this.updateResViewSettings() }, 1000);
    }
    

    private updateResViewSettings() {
        let rvSettings: ResourceViewProjectSettings = this.getResViewProjectSettings();
        this.settingsService.storeSettingForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, SettingsEnum.resourceView, rvSettings, this.project).subscribe(
            () => {
                //in case the edited project is the active one, update the settings stored in VBContext
                if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                    VBContext.getWorkingProjectCtx().getProjectSettings().resourceView = rvSettings;
                }
            }
        )
    }

    setAsSystemDefault() {
        this.basicModals.confirm({key:"ACTIONS.SET_AS_SYSTEM_DEFAULT"}, {key:"MESSAGES.CONFIG_SET_SYSTEM_DEFAULT_CONFIRM"}, ModalType.warning).then(
            () => {
                let rvSettings: ResourceViewProjectSettings = this.getResViewProjectSettings();
                this.settingsService.storeSettingDefault(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, Scope.SYSTEM, SettingsEnum.resourceView, rvSettings).subscribe(
                    () => {
                        this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.CONFIG_SYSTEM_DEFAULT_SET"});
                    }
                )
            },
            () => {}
        );
    }

    restoreSystemDefault() {
        this.basicModals.confirm({key:"ACTIONS.RESTORE_SYSTEM_DEFAULT"}, {key:"MESSAGES.CONFIG_RESTORE_SYSTEM_DEFAULT_CONFIRM"}, ModalType.warning).then(
            () => {
                let rvSettings: ResourceViewProjectSettings = null;
                this.settingsService.storeSettingForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, SettingsEnum.resourceView, rvSettings, this.project).subscribe(
                    () => {
                        //in case the edited project is the active one, update the settings stored in VBContext
                        if (VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()) {
                            //update the settings getting them from server in order to exploit the fallback-to-default mechanism
                            this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, this.project).subscribe(
                                settings => {
                                    this.rvSettings = settings.getPropertyValue(SettingsEnum.resourceView);
                                    this.initResViewSettings();
                                    this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.CONFIG_SYSTEM_DEFAULT_RESTORED"});
                                }
                            );
                        }
                    }
                )
            },
            () => {}
        );
    }

    private getResViewProjectSettings(): ResourceViewProjectSettings {
        let customSections: {[key: string]: CustomSection} = {}; //map name -> CustomSection
        for (let csId in this.customSections) {
            customSections[csId] = {
                matchedProperties: this.customSections[csId].map(p => p.toNT())
            }
        }
        let templates: {[key: string]: ResViewPartition[]} = {}; //map role -> sections
        for (let role in this.templates) {
            templates[role] = this.templates[role].enabled;
        }

        let rvSettings: ResourceViewProjectSettings = {
            customSections: customSections,
            templates: templates
        };
        return rvSettings;
    }


}