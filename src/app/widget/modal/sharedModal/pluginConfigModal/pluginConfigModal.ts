import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { PluginConfiguration } from "../../../../models/Plugins";
import { ARTURIResource } from "../../../../models/ARTResources";

export class PluginConfigModalData extends BSModalContext {
    /**
     * @param configuration 
     */
    constructor(public configuration: PluginConfiguration) {
        super();
    }
}

@Component({
    selector: "plugin-config-modal",
    templateUrl: "./pluginConfigModal.html",
})
export class PluginConfigModal implements ModalComponent<PluginConfigModalData> {
    context: PluginConfigModalData;

    private config: PluginConfiguration;

    constructor(public dialog: DialogRef<PluginConfigModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //copy the context configuration (so changes of params don't affect original configuration params)
        this.config = this.context.configuration.clone();
    }

    private isOkClickable(): boolean {
        return !this.config.requireConfiguration();
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.config);
    }

    cancel() {
        this.dialog.dismiss();
    }

}