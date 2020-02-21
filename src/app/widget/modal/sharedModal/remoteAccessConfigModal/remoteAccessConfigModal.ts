import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { RemoteRepositoryAccessConfig } from "../../../../models/Project";
import { Properties } from "../../../../models/Properties";
import { PreferencesSettingsServices } from "../../../../services/preferencesSettingsServices";
import { BasicModalServices } from "../../basicModal/basicModalServices";

@Component({
    selector: "remote-access-config-modal",
    templateUrl: "./remoteAccessConfigModal.html",
})
export class RemoteAccessConfigModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private savedConfigs: RemoteRepositoryAccessConfig[] = [];
    private selectedConfig: RemoteRepositoryAccessConfig;

    private newConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };

    constructor(public dialog: DialogRef<BSModalContext>, private basicModals: BasicModalServices, private prefService: PreferencesSettingsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.prefService.getSystemSettings([Properties.setting_remote_configs]).subscribe(
            stResp => {
                if (stResp[Properties.setting_remote_configs] != null) {
                    this.savedConfigs = <RemoteRepositoryAccessConfig[]> JSON.parse(stResp[Properties.setting_remote_configs]);
                }
            }
        );
    }

    private selectConfig(c: RemoteRepositoryAccessConfig) {
        if (this.selectedConfig == c) {
            this.selectedConfig = null;
        } else {
            this.selectedConfig = c;
        }
    }

    createConfiguration() {
        //add the new configuration only if another config with the same url doesn't exist
        for (var i = 0; i < this.savedConfigs.length; i++) {
            if (this.savedConfigs[i].serverURL == this.newConfig.serverURL) {
                this.basicModals.alert("Duplicate configuration", "A configuration for the serverURL '" + this.newConfig.serverURL 
                    + "' already exists", "warning");
                return;
            }
        }
        this.savedConfigs.push(this.newConfig);
        this.updateConfigurations();
        this.newConfig = { serverURL: null, username: null, password: null }; //reset config
    }

    private deleteConfig(c: RemoteRepositoryAccessConfig) {
        this.basicModals.confirm("Delete configuration", "You are deleting the configuration. Are you sure?", "warning").then(
            () => {
                this.savedConfigs.splice(this.savedConfigs.indexOf(c), 1);
                if (this.selectedConfig == c) {
                    this.selectedConfig = null;
                }
                this.updateConfigurations();
            },
            () => {}
        )
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
    private updateConfigurations() {
        let conf: string;
        if (this.savedConfigs.length == 0) {
            conf = null;
        } else {
            conf = JSON.stringify(this.savedConfigs);
        }
        this.prefService.setSystemSetting(Properties.setting_remote_configs, conf).subscribe();
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