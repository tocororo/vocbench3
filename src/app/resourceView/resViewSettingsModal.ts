import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigurationComponents } from "../models/Configuration";
import { SettingsProp } from "../models/Plugins";
import { PartitionFilterPreference, Properties } from "../models/Properties";
import { PreferencesSettingsServices } from "../services/preferencesSettingsServices";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalType } from '../widget/modal/Modals';
import { LoadConfigurationModalReturnData } from "../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "res-view-settings-modal",
    templateUrl: "./resViewSettingsModal.html",
})
export class ResViewSettingsModal {

    template: PartitionFilterPreference;

    constructor(public activeModal: NgbActiveModal, private vbProp: VBProperties, private prefService: PreferencesSettingsServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {}

    ngOnInit() {
        this.initTemplate();
    }

    private initTemplate() {
        this.template = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.resViewPartitionFilter;
    }

    loadTemplate() {
        this.sharedModals.loadConfiguration({key:"ACTIONS.LOAD_TEMPLATE"}, ConfigurationComponents.TEMPLATE_STORE, true, false).then(
            (conf: LoadConfigurationModalReturnData) => {
                let templateProp: SettingsProp = conf.configuration.properties.find(p => p.name == "template");
                if (templateProp != null) {
                    this.template = templateProp.value;
                    this.updateTemplate();
                }
            }
        )
    }

    storeTemplate() {
        let config: { [key: string]: any } = {
            template: this.template
        }
        this.sharedModals.storeConfiguration({key:"ACTIONS.SAVE_TEMPLATE"}, ConfigurationComponents.TEMPLATE_STORE, config);
    }

    setUserDefault() {
        this.basicModals.confirm({key: "ACTIONS.SET_AS_DEFAULT"}, "You are setting the current template as default configuration for all the projects. Are you sure?",
            ModalType.warning).then(
            () => {
                this.prefService.setPUSettingUserDefault(Properties.pref_res_view_partition_filter, VBContext.getLoggedUser().getEmail(),
                    JSON.stringify(this.template)).subscribe();
            },
            () => {}
        )
        
    }

    /**
     * Reset the preference to the default, namely remove set the PUSettings, so if there is a default it is retrieved through the fallback
     */
    restoreDefault() {
        this.basicModals.confirm({key:"ACTIONS.RESTORE_DEFAULT"}, "You are overriding the current template by restoring the default configuration. Are you sure?",
            ModalType.warning).then(
            () => {
                this.prefService.setPUSetting(Properties.pref_res_view_partition_filter, null).subscribe(
                    () => {
                        //refreshes the template cached in the project preferences
                        this.vbProp.refreshResourceViewPartitionFilter().subscribe(
                            () => {
                                this.initTemplate();
                            }
                        );
                    }
                );
            },
            () => {}
        );
    }

    updateTemplate() {
        this.vbProp.setResourceViewPartitionFilter(this.template);
    }

    ok() {
        this.activeModal.close();
    }

}