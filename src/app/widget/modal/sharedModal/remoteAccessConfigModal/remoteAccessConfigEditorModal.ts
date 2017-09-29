import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { RemoteRepositoryAccessConfig } from "../../../../models/Project";
import { Properties } from "../../../../models/Properties";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { PreferencesSettingsServices } from "../../../../services/preferencesSettingsServices";

@Component({
    selector: "remote-access-config-editor-modal",
    templateUrl: "./remoteAccessConfigEditorModal.html",
})
export class RemoteAccessConfigEditorModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private savedConfigs: RemoteRepositoryAccessConfig[] = [];

    private newConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };

    constructor(public dialog: DialogRef<BSModalContext>, private basicModals: BasicModalServices,
        private prefSettingService: PreferencesSettingsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.prefSettingService.getSystemSettings([Properties.setting_remote_configs]).subscribe(
            stResp => {
                if (stResp[Properties.setting_remote_configs] != null) {
                    this.savedConfigs = <RemoteRepositoryAccessConfig[]> JSON.parse(stResp[Properties.setting_remote_configs]);
                }
            }
        );
    }

    private createConfiguration() {
        //add the new configuration only if another config with the same url doesn't exist
        for (var i = 0; i < this.savedConfigs.length; i++) {
            if (this.savedConfigs[i].serverURL == this.newConfig.serverURL) {
                this.basicModals.alert("Duplicate configuration", "A configuration for the serverURL '" + this.newConfig.serverURL 
                    + "' already exists", "error");
                return;
            }
        }
        this.savedConfigs.push(this.newConfig);
        this.prefSettingService.setSystemSetting(Properties.setting_remote_configs, JSON.stringify(this.savedConfigs)).subscribe(
            stResp => {
                this.newConfig = { serverURL: null, username: null, password: null }; //reset config
            }
        );
    }

    private updateConfServerURL(conf: RemoteRepositoryAccessConfig, newValue: string) {
        conf.serverURL = newValue;
        this.updateConfigurations();
    }
    private updateConfUsername(conf: RemoteRepositoryAccessConfig, newValue: string) {
        conf.username = newValue;
        this.updateConfigurations();
    }
    private updateConfPassword(conf: RemoteRepositoryAccessConfig, newValue: string) {
        conf.password = newValue;
        this.updateConfigurations();
    }

    private deleteConfiguration(conf: RemoteRepositoryAccessConfig) {
        this.savedConfigs.splice(this.savedConfigs.indexOf(conf), 1);
        if (this.savedConfigs.length == 0) {
            this.prefSettingService.setSystemSetting(Properties.setting_remote_configs, null).subscribe();
        } else {
            this.updateConfigurations();
        }
    }

    private updateConfigurations() {
        this.prefSettingService.setSystemSetting(Properties.setting_remote_configs, JSON.stringify(this.savedConfigs)).subscribe();
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}