import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class OntoMgrConfigModalData extends BSModalContext {
    /**
     * @param configuration 
     */
    constructor(public configuration: any = {}) {
        super();
        this.keyboard = null;
    }
}

@Component({
    selector: "onto-mgr-config-modal",
    templateUrl: "./ontoMgrConfigModal.html",
})
export class OntoMgrConfigModal implements ModalComponent<OntoMgrConfigModalData> {
    context: OntoMgrConfigModalData;
    
    constructor(public dialog: DialogRef<OntoMgrConfigModalData>) {
        this.context = dialog.context;
    }
    
    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.context.configuration);
    }

}