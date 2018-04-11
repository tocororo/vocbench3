import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { CollaborationServices } from "../../services/collaborationServices";
import { ExtensionsServices } from "../../services/extensionsServices";
import { SettingsServices } from "../../services/settingsServices";
import { Settings, ExtensionPointID, ExtensionFactory, Scope } from "../../models/Plugins";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { VBContext } from "../../utils/VBContext";
import { VBCollaboration } from "../../utils/VBCollaboration";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "collaboration-user-settings-modal",
    templateUrl: "./collaborationUserSettingsModal.html",
})
export class CollaborationUserSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private collSysBackendId: string;
    private userSettings: Settings;

    constructor(public dialog: DialogRef<BSModalContext>,
        private extensionService: ExtensionsServices, private settingsService: SettingsServices,
        private collaborationService: CollaborationServices, 
        private vbColl: VBCollaboration,
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.collSysBackendId = this.vbColl.getBackendId();
        if (this.collSysBackendId != null) {
            this.settingsService.getSettings(this.collSysBackendId, Scope.PROJECT_USER).subscribe(
                settings => {
                    this.userSettings = settings;
                }
            );
        }
    }

    private isOkClickable(): boolean {
        if (this.userSettings == null) {
            return false;
        }
        if (this.userSettings.requireConfiguration()) {
            return false;
        }
        return true;
    }

    ok(event: Event) {
        let settingsParam = this.userSettings.getPropertiesAsMap();
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.settingsService.storeSettings(this.collSysBackendId, Scope.PROJECT_USER, settingsParam).subscribe(
            resp => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                event.stopPropagation();
                event.preventDefault();
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}