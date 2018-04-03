import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { Settings, SettingsProp } from "../../../../models/Plugins";
import { ARTURIResource } from "../../../../models/ARTResources";

export class PluginConfigModalData extends BSModalContext {
    /**
     * @param configuration 
     */
    constructor(public configuration: Settings) {
        super();
    }
}

@Component({
    selector: "plugin-config-modal",
    templateUrl: "./pluginConfigModal.html",
})
export class PluginConfigModal implements ModalComponent<PluginConfigModalData> {
    context: PluginConfigModalData;

    private config: Settings;

    constructor(public dialog: DialogRef<PluginConfigModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //copy the context configuration (so changes of params don't affect original configuration params)
        this.config = this.context.configuration.clone();
    }

    private updateBoolean(prop: SettingsProp, value: boolean) {
        prop.value = value;
    }

    private isOkClickable(): boolean {
        return !this.config.requireConfiguration();
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        console.log(this.config);
        this.dialog.close(this.config);
    }

    cancel() {
        this.dialog.dismiss();
    }

}