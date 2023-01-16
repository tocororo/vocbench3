import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, from, Observable, of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { RDFResourceRolesEnum } from 'src/app/models/ARTResources';
import { DataStructureUtils } from 'src/app/models/DataStructure';
import { ExtensionPointID, Scope } from 'src/app/models/Plugins';
import { CustomTreeRootSelection, CustomTreeSettings, SettingsEnum } from 'src/app/models/Properties';
import { SettingsServices } from 'src/app/services/settingsServices';
import { VBRequestOptions } from 'src/app/utils/HttpManager';
import { ProjectContext, VBContext } from 'src/app/utils/VBContext';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "tree-list-settings-modal",
    templateUrl: "./treeListSettingsModal.html",
})
export class TreeListSettingsModal {

    @Input() projectCtx: ProjectContext;

    isEdoal: boolean;

    showDeprecated: boolean;

    tabsStruct: { tab: RDFResourceRolesEnum, translationKey: string, visible: boolean }[];

    customTreeSettings: CustomTreeSettings;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices, private settingsService: SettingsServices, private vbProp: VBProperties) { }

    ngOnInit() {
        this.showDeprecated = this.vbProp.getShowDeprecated();


        let structurePanelFilter = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().structurePanelFilter;

        let ctxProjModel = VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getModelType();
        this.tabsStruct = DataStructureUtils.modelPanelsMap[ctxProjModel].map(tab => {
            return { tab: tab, translationKey: DataStructureUtils.panelTranslationMap[tab], visible: !structurePanelFilter.includes(tab) };
        });

        this.customTreeSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().customTreeSettings;

    }

    onSettingsReset() {
        let requestsOpt = new VBRequestOptions({ ctxProject: VBContext.getWorkingProjectCtx(this.projectCtx).getProject() });
        this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.CONFIG_RESTORE_PROJECT_DEFAULT_CONFIRM" }, ModalType.warning).then(
            () => {
                let settings: CustomTreeSettings = null;
                this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.customTree, settings, requestsOpt).subscribe(
                    () => {
                        //reinitialize so exploit the fallback to default (if any) mechanism
                        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, requestsOpt).subscribe(
                            settings => {
                                this.customTreeSettings = settings.getPropertyValue(SettingsEnum.customTree);
                                VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().customTreeSettings = settings.getPropertyValue(SettingsEnum.customTree);
                                this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.CONFIG_PROJECT_DEFAULT_RESTORED" });
                            }
                        );
                    }
                );
            },
            () => { }
        );
    }

    ok() {
        /* Visible panels */
        //check if at least a tab is visible
        if (this.tabsStruct.every(t => !t.visible)) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.CANNOT_HIDE_ALL_DATA_TABS" }, ModalType.warning);
            return;
        }
        if (this.isTabStructSettingsValid()) {
            this.isCustomTreeSettingsValid().subscribe(
                valid => {
                    if (valid) {
                        //both settings are valid => submit changes
                        this.submitChanges();
                    }
                }
            );
        }
    }

    private isTabStructSettingsValid(): boolean {
        //check if at least a tab is visible
        if (this.tabsStruct.every(t => !t.visible)) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.CANNOT_HIDE_ALL_DATA_TABS" }, ModalType.warning);
            return false;
        } else {
            return true;
        }
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

    private submitChanges() {
        let updateSettingsFn: Observable<any>[] = [];

        let filteredTabs: RDFResourceRolesEnum[] = this.tabsStruct.filter(t => !t.visible).map(t => t.tab);
        updateSettingsFn.push(this.vbProp.setStructurePanelFilter(this.projectCtx, filteredTabs));

        updateSettingsFn.push(this.vbProp.setCustomTreeSettings(this.projectCtx, this.customTreeSettings));

        this.vbProp.setShowDeprecated(this.showDeprecated);

        concat(...updateSettingsFn).pipe(
            toArray()
        ).subscribe(
            () => {
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}