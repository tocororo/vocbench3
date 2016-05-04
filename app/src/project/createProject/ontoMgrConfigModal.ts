import {Component} from "@angular/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class OntoMgrConfigModalContent {
    /**
     * @param configuration 
     */
    constructor(public configuration: any = {}) {}
}

@Component({
    selector: "onto-mgr-config-modal",
    templateUrl: "app/src/project/createProject/ontoMgrConfigModal.html",
})
export class OntoMgrConfigModal implements ICustomModalComponent {
    dialog: ModalDialogInstance;
    context: OntoMgrConfigModalContent;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <OntoMgrConfigModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.context.configuration);
    }

}