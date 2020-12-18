import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RemoteRepositoryAccessConfig } from "../../../../models/Project";
import { Properties } from "../../../../models/Properties";
import { PreferencesSettingsServices } from "../../../../services/preferencesSettingsServices";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { ModalType } from '../../Modals';

@Component({
    selector: "remote-access-config-modal",
    templateUrl: "./remoteAccessConfigModal.html",
})
export class RemoteAccessConfigModal {

    savedConfigs: RemoteRepositoryAccessConfig[] = [];

    newConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices, private prefService: PreferencesSettingsServices) {}

    ngOnInit() {
        this.prefService.getSystemSettings([Properties.setting_remote_configs]).subscribe(
            stResp => {
                if (stResp[Properties.setting_remote_configs] != null) {
                    this.savedConfigs = <RemoteRepositoryAccessConfig[]> JSON.parse(stResp[Properties.setting_remote_configs]);
                }
            }
        );
    }

    createConfiguration() {
        //add the new configuration only if another config with the same url doesn't exist
        for (var i = 0; i < this.savedConfigs.length; i++) {
            if (this.savedConfigs[i].serverURL == this.newConfig.serverURL) {
                this.basicModals.alert({key:"STATUS.ERROR"}, "A configuration for the serverURL '" + this.newConfig.serverURL 
                    + "' already exists", ModalType.warning);
                return;
            }
        }
        this.savedConfigs.push(this.newConfig);
        this.updateConfigurations();
        this.newConfig = { serverURL: null, username: null, password: null }; //reset config
    }

    private deleteConfig(c: RemoteRepositoryAccessConfig) {
        this.basicModals.confirm({key:"ACTIONS.DELETE_CONFIGURATION"}, "You are deleting the configuration. Are you sure?", ModalType.warning).then(
            () => {
                this.savedConfigs.splice(this.savedConfigs.indexOf(c), 1);
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

    ok() {
        this.activeModal.close();
    }

}