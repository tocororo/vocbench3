import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Scope, Settings } from "../../models/Plugins";
import { SettingsServices } from "../../services/settingsServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBCollaboration } from "../../utils/VBCollaboration";

@Component({
    selector: "collaboration-user-settings-modal",
    templateUrl: "./collaborationUserSettingsModal.html",
})
export class CollaborationUserSettingsModal {

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    collSysBackendId: string;
    private userSettings: Settings;

    constructor(public activeModal: NgbActiveModal, private settingsService: SettingsServices, private vbColl: VBCollaboration) {
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

    isOkClickable(): boolean {
        if (this.userSettings == null) {
            return false;
        }
        if (this.userSettings.requireConfiguration()) {
            return false;
        }
        return true;
    }

    ok() {
        let settingsParam = this.userSettings.getPropertiesAsMap();
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.settingsService.storeSettings(this.collSysBackendId, Scope.PROJECT_USER, settingsParam).subscribe(
            resp => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}