import { Component } from "@angular/core";
import { BSModalContext, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent, Modal, OverlayConfig } from "angular2-modal";
import { RemoteRepositoryAccessConfig } from "../../../../models/Project";
import { Properties } from "../../../../models/Properties";
import { PreferencesSettingsServices } from "../../../../services/preferencesSettingsServices";
import { RemoteAccessConfigEditorModal } from "./remoteAccessConfigEditorModal";

export class RemoteAccessConfigModalData extends BSModalContext {
    /**
     * @param configuration 
     */
    constructor(public remoteConfig: RemoteRepositoryAccessConfig) {
        super();
    }
}

@Component({
    selector: "remote-access-config-modal",
    templateUrl: "./remoteAccessConfigModal.html",
})
export class RemoteAccessConfigModal implements ModalComponent<RemoteAccessConfigModalData> {
    context: RemoteAccessConfigModalData;

    private savedConfigs: RemoteRepositoryAccessConfig[] = [];
    private selectedConfig: RemoteRepositoryAccessConfig;

    constructor(public dialog: DialogRef<RemoteAccessConfigModalData>, private modal: Modal, 
        private prefSettingService: PreferencesSettingsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.selectedConfig = this.context.remoteConfig;
        this.initConfigs();
    }

    private initConfigs() {
        console.log("savedConfig", this.savedConfigs);
        this.prefSettingService.getSystemSettings([Properties.setting_remote_configs]).subscribe(
            stResp => {
                if (stResp[Properties.setting_remote_configs] != null) {
                    console.log("savedConfig not null", stResp);
                    this.savedConfigs = <RemoteRepositoryAccessConfig[]> JSON.parse(stResp[Properties.setting_remote_configs]);
                    /* initialize the configuration selected, this is usefull expecially when initConfigs()
                    is invoked in changeRemoteConfig() to avoid that deleted configuration are still selected */
                    let configFound: boolean = false;
                    for (var i = 0; i < this.savedConfigs.length; i++) {
                        if (this.savedConfigs[i].serverURL == this.selectedConfig.serverURL) {
                            this.selectedConfig = this.savedConfigs[i];
                            configFound = true;
                            break;
                        }
                    }
                    if (!configFound) {
                        this.selectedConfig = { serverURL: null, username: null, password: null };
                    }
                }
            }
        );
    }

    private changeRemoteConfig() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };

        this.modal.open(RemoteAccessConfigEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                (newConfig: any) => {
                    this.initConfigs();
                },
                () => {}
            )
        );
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedConfig);
    }

    cancel() {
        this.dialog.dismiss();
    }

}