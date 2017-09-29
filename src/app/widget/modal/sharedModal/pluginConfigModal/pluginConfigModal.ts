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
        this.config = Object.assign({}, this.context.configuration);
    }

    private isOkClickable(): boolean {
        var result = true;
        for (var i = 0; i < this.config.params.length; i++) {
            if (this.config.params[i].required && (this.config.params[i].value == null || this.config.params[i].value.trim() == "")) {
                result = false;
            }
        }
        return result;
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