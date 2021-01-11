import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { Settings } from "../../../../models/Plugins";

@Component({
    selector: "plugin-config-modal",
    templateUrl: "./pluginConfigModal.html",
})
export class PluginConfigModal {
    @Input() configuration: Settings;
    @Input() handler: PluginSettingsHandler;

    config: Settings;

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        //copy the input configuration (so changes of params don't affect original configuration params)
        this.config = this.configuration.clone();
    }

    isOkClickable(): boolean {
        return !this.config.requireConfiguration();
    }

    ok() {
        if (this.handler) {
            this.handler(this.config).subscribe(() => {
                this.activeModal.close(this.config);
            });
        } else {
            this.activeModal.close(this.config);
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export interface PluginSettingsHandler {
    (s: Settings): Observable<any>
}