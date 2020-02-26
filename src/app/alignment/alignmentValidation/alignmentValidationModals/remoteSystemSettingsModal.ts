import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { PreferencesSettingsServices } from "../../../services/preferencesSettingsServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "remote-system-settings-modal",
    templateUrl: "./remoteSystemSettingsModal.html",
})
export class RemoteSystemSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private readonly remoteSystemPortPref: string = "alignment.remote.port";
    
    private remoteSystemPort: string;
    private remoteSystemPortPristine: string;
    
    constructor(public dialog: DialogRef<BSModalContext>, private prefService: PreferencesSettingsServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.prefService.getSystemSettings([this.remoteSystemPortPref]).subscribe(
            prefs => {
                this.remoteSystemPort = prefs[this.remoteSystemPortPref];
                this.remoteSystemPortPristine = this.remoteSystemPort;
            }
        )
    }
    
    ok(event: Event) {
        if (this.remoteSystemPort != this.remoteSystemPortPristine) { //changed
            try {
                let portNumber = parseInt(this.remoteSystemPort);
                if (isNaN(portNumber) || portNumber < 0 || portNumber > 65535) throw new Error();
            } catch (err) {
                this.basicModals.alert("Invalid port", this.remoteSystemPort + " is not a valid port number", "warning");
                return;
            }
            this.prefService.setSystemSetting(this.remoteSystemPortPref, this.remoteSystemPort).subscribe(
                () => {
                    event.stopPropagation();
                    this.dialog.close();
                }
            );
        } else {
            event.stopPropagation();
            this.dialog.close();
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
}