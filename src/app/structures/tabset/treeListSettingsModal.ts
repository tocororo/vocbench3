import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RDFResourceRolesEnum } from 'src/app/models/ARTResources';
import { DataStructureUtils } from 'src/app/models/DataStructure';
import { EDOAL } from 'src/app/models/Vocabulary';
import { ProjectContext, VBContext } from 'src/app/utils/VBContext';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { VBEventHandler } from "../../utils/VBEventHandler";
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

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices, private vbProp: VBProperties, private eventHandler: VBEventHandler) { }

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
    }

    onShowDeprecatedChange() {
        
    }

    ok() {
        //check if at least a tab is visible
        if (this.tabsStruct.every(t => !t.visible)) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.CANNOT_HIDE_ALL_DATA_TABS" }, ModalType.warning);
            return;
        }
        let filteredTabs: RDFResourceRolesEnum[] = this.tabsStruct.filter(t => !t.visible).map(t => t.tab);
        this.vbProp.setStructurePanelFilter(filteredTabs);

        this.vbProp.setShowDeprecated(this.showDeprecated);
        this.eventHandler.showDeprecatedChangedEvent.emit(this.showDeprecated);

        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }

}