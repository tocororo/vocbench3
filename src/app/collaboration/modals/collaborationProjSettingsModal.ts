import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { CollaborationServices } from "../../services/collaborationServices";
import { ExtensionsServices } from "../../services/extensionsServices";
import { SettingsServices } from "../../services/settingsServices";
import { Plugin, Settings, ExtensionPointID, ExtensionFactory, Scope } from "../../models/Plugins";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { VBContext } from "../../utils/VBContext";
import { VBCollaboration } from "../../utils/VBCollaboration";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "collaboration-proj-settings-modal",
    templateUrl: "./collaborationProjSettingsModal.html",
})
export class CollaborationProjSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private extensions: ExtensionFactory[];
    private selectedExtension: ExtensionFactory;

    private projSettings: Settings;

    constructor(public dialog: DialogRef<BSModalContext>,
        private extensionService: ExtensionsServices, private settingsService: SettingsServices,
        private collaborationService: CollaborationServices, 
        private vbColl: VBCollaboration,
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.extensionService.getExtensions(ExtensionPointID.COLLABORATION_BACKEND_ID).subscribe(
            extensions => {
                this.extensions = extensions;
                let backedndId = this.vbColl.getBackendId();
                if (backedndId != null) {
                    for (var i = 0; i < this.extensions.length; i++) {
                        if (this.extensions[i].id == backedndId) {
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

    private onExtensionChange() {
        this.initSettings();
    }

    private isOkClickable(): boolean {
        if (this.projSettings == null) {
            return false;
        }
        if (this.projSettings.requireConfiguration()) {
            return false;
        }
        return true;
    }

    ok(event: Event) {
        let settingsParam = this.projSettings.getPropertiesAsMap();
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.settingsService.storeSettings(this.selectedExtension.id, Scope.PROJECT, settingsParam).subscribe(
            resp => {
                this.collaborationService.activateCollaboratioOnProject(this.selectedExtension.id).subscribe(
                    resp => {
                        UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                        this.vbColl.initCollaborationSystem();
                        event.stopPropagation();
                        event.preventDefault();
                        this.dialog.close();
                    }
                )
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}