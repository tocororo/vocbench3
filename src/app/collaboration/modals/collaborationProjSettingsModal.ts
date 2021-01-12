import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ExtensionFactory, ExtensionPointID, Scope, Settings } from "../../models/Plugins";
import { CollaborationServices } from "../../services/collaborationServices";
import { ExtensionsServices } from "../../services/extensionsServices";
import { SettingsServices } from "../../services/settingsServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBCollaboration } from "../../utils/VBCollaboration";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "collaboration-proj-settings-modal",
    templateUrl: "./collaborationProjSettingsModal.html",
})
export class CollaborationProjSettingsModal {

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    extensions: ExtensionFactory[];
    selectedExtension: ExtensionFactory;

    projSettings: Settings;

    resettable: boolean = false; //true if a collaboration system was already configured => shows a reset button

    constructor(public activeModal: NgbActiveModal, private extensionService: ExtensionsServices, private settingsService: SettingsServices,
        private collaborationService: CollaborationServices, private vbColl: VBCollaboration, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.init();
    }

    private init() {
        this.extensions = null;
        this.selectedExtension = null;
        this.projSettings = null;
        this.extensionService.getExtensions(ExtensionPointID.COLLABORATION_BACKEND_ID).subscribe(
            extensions => {
                this.extensions = extensions;
                let backendId = this.vbColl.getBackendId();
                if (backendId != null) {
                    this.resettable = true;
                    for (var i = 0; i < this.extensions.length; i++) {
                        if (this.extensions[i].id == backendId) {
                            this.selectedExtension = this.extensions[i];
                            break;
                        }
                    }
                    this.initSettings();
                }
            }
        );
    }

    private initSettings() {
        this.settingsService.getSettings(this.selectedExtension.id, Scope.PROJECT).subscribe(
            settings => {
                this.projSettings = settings;
            }
        );
    }

    reset() {
        this.basicModals.confirm({key: "COLLABORATION.ACTIONS.RESET_COLLABORATION_SYSTEM"}, {key:"MESSAGES.DISABLE_COLLABORATION_SYSTEM_CONFIRM"}, ModalType.warning).then(
            () => {
                this.collaborationService.resetCollaborationOnProject().subscribe(
                    () => {
                        this.vbColl.initCollaborationSystem().subscribe(
                            () => this.activeModal.close()
                        );
                    }
                )
            }, 
            () => {}
        )
        
    }

    onExtensionChange() {
        this.initSettings();
    }

    isOkClickable(): boolean {
        if (this.projSettings == null) {
            return false;
        }
        if (this.projSettings.requireConfiguration()) {
            return false;
        }
        return true;
    }

    ok() {
        let settingsParam = this.projSettings.getPropertiesAsMap();
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.settingsService.storeSettings(this.selectedExtension.id, Scope.PROJECT, settingsParam).subscribe(
            resp => {
                this.collaborationService.activateCollaboratioOnProject(this.selectedExtension.id).subscribe(
                    resp => {
                        UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                        this.vbColl.initCollaborationSystem();
                        this.activeModal.close();
                    }
                )
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}