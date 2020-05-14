import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents } from "../../../models/Configuration";
import { SettingsProp } from "../../../models/Plugins";
import { PartitionFilterPreference, Properties } from "../../../models/Properties";
import { PreferencesSettingsServices } from "../../../services/preferencesSettingsServices";
import { VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "res-view-settings-modal",
    templateUrl: "./resViewSettingsModal.html",
})
export class ResViewSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private template: PartitionFilterPreference;

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties, private prefService: PreferencesSettingsServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.initTemplate();
    }

    private initTemplate() {
        this.template = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPartitionFilter;
    }

    private loadTemplate() {
        this.sharedModals.loadConfiguration("Load template", ConfigurationComponents.TEMPLATE_STORE, true, false).then(
            (conf: LoadConfigurationModalReturnData) => {
                let templateProp: SettingsProp = conf.configuration.properties.find(p => p.name == "template");
                if (templateProp != null) {
                    this.template = templateProp.value;
                    this.updateTemplate();
                }
            }
        )
    }

    private storeTemplate() {
        let config: { [key: string]: any } = {
            template: this.template
        }
        this.sharedModals.storeConfiguration("Store template", ConfigurationComponents.TEMPLATE_STORE, config);
    }

    private setUserDefault() {
        this.basicModals.confirm("Set as default", "You are setting the current template as default configuration for all the projects. Are you sure?",
            "warning").then(
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
    private restoreDefault() {
        this.basicModals.confirm("Restore default", "You are overriding the current template by restoring the default configuration. Are you sure?",
            "warning").then(
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

    private updateTemplate() {
        this.vbProp.setResourceViewPartitionFilter(this.template);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}