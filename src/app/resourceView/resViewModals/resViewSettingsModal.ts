import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents } from "../../models/Configuration";
import { SettingsProp } from "../../models/Plugins";
import { PartitionFilterPreference, Properties } from "../../models/Properties";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "res-view-settings-modal",
    templateUrl: "./resViewSettingsModal.html",
})
export class ResViewSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private template: PartitionFilterPreference;

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties, private prefService: PreferencesSettingsServices,
        private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
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

    // private storeTemplate() {
    //     let config: { [key: string]: any } = {
    //         template: this.userTemplate
    //     }
    //     this.sharedModals.storeConfiguration("Store template", ConfigurationComponents.TEMPLATE_STORE, config);
    // }

    private setTemplateAsUserDefault() {
        let prefValue = (Object.keys(this.template).length != 0) ? JSON.stringify(this.template) : null;
        this.prefService.setPUSettingUserDefault(Properties.pref_res_view_partition_filter, VBContext.getLoggedUser().getEmail(), prefValue).subscribe(
            () => {
                //update the cached PU-settings
                this.vbProp.refreshResourceViewPartitionFilter();
            }
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