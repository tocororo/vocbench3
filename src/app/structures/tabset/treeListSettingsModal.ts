import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { RDFResourceRolesEnum } from 'src/app/models/ARTResources';
import { DataStructureUtils } from 'src/app/models/DataStructure';
import { ExtensionPointID, Scope } from 'src/app/models/Plugins';
import { CustomTreeSettings, SettingsEnum } from 'src/app/models/Properties';
import { EDOAL } from 'src/app/models/Vocabulary';
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

        this.isEdoal = VBContext.getWorkingProject().getModelType() == EDOAL.uri;

        if (!this.isEdoal) { //for simplicity, do not allow edit tab visualization in EDOAL project
            let ctxProjModel = VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getModelType();
            this.tabsStruct = DataStructureUtils.modelPanelsMap[ctxProjModel].map(tab => {
                return { tab: tab, translationKey: DataStructureUtils.panelTranslationMap[tab], visible: !structurePanelFilter.includes(tab) };
            });
        }

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
        let updateSettingsFn: Observable<any>[] = [];
        //check if at least a tab is visible
        if (this.tabsStruct.every(t => !t.visible)) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.CANNOT_HIDE_ALL_DATA_TABS" }, ModalType.warning);
            return;
        }
        let filteredTabs: RDFResourceRolesEnum[] = this.tabsStruct.filter(t => !t.visible).map(t => t.tab);
        updateSettingsFn.push(this.vbProp.setStructurePanelFilter(filteredTabs));

        if (this.customTreeSettings.enabled && (this.customTreeSettings.type == null || this.customTreeSettings.hierarchicalProperty == null)) {
            //settings not empty but type or prop not configured
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "INCOMPLETE CONFIGURATION FOR CUSTOM TREE" }, ModalType.warning);
            return;
        } else {
            updateSettingsFn.push(this.vbProp.setCustomTreeSettings(this.customTreeSettings));
        }

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