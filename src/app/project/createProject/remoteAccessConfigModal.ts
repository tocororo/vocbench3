import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class RemoteAccessConfigModalData extends BSModalContext {
    /**
     * @param configuration 
     */
    constructor(public configuration: any = {}) {
        super();
    }
}

@Component({
    selector: "remote-access-config-modal",
    templateUrl: "./remoteAccessConfigModal.html",
})
export class RemoteAccessConfigModal implements ModalComponent<RemoteAccessConfigModalData> {
    context: RemoteAccessConfigModalData;
    
    constructor(public dialog: DialogRef<RemoteAccessConfigModalData>) {
        this.context = dialog.context;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.context.configuration);
    }

}