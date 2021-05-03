import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID, Scope } from "src/app/models/Plugins";
import { SettingsServices } from "src/app/services/settingsServices";
import { RemoteRepositoryAccessConfig } from "../../../../models/Project";
import { SettingsEnum } from "../../../../models/Properties";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { ModalType } from '../../Modals';

@Component({
    selector: "remote-access-config-modal",
    templateUrl: "./remoteAccessConfigModal.html",
})
export class RemoteAccessConfigModal {

    savedConfigs: RemoteRepositoryAccessConfig[] = [];

    newConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices, private settingsService: SettingsServices) {}

    ngOnInit() {
        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM).subscribe(
            settings => {
                this.savedConfigs = settings.getPropertyValue(SettingsEnum.remoteConfigs);
            }
        )
    }

    createConfiguration() {
        //add the new configuration only if another config with the same url doesn't exist
        for (var i = 0; i < this.savedConfigs.length; i++) {
            if (this.savedConfigs[i].serverURL == this.newConfig.serverURL) {
                this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.ALREADY_EXISTING_CONFIG_FOR_SERVER_URL"}, ModalType.warning);
                return;
            }
        }
        this.savedConfigs.push(this.newConfig);
        this.updateConfigurations();
        this.newConfig = { serverURL: null, username: null, password: null }; //reset config
    }

    private deleteConfig(c: RemoteRepositoryAccessConfig) {
        this.basicModals.confirm({key:"ACTIONS.DELETE_CONFIGURATION"}, {key:"MESSAGES.DELETE_CONFIG_CONFIRM"}, ModalType.warning).then(
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
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.remoteConfigs, this.savedConfigs).subscribe();
    }

    ok() {
        this.activeModal.close();
    }

}