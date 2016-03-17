import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from '../../../../utils/ARTResources';
import {InstanceListComponent} from '../../../../owl/instanceList/instanceListComponent';

export class InstanceListModalContent {
    constructor(public title: string = 'Modal Title', public cls: ARTURIResource) {}
}

@Component({
    selector: "instance-list-modal",
    templateUrl: "app/src/widget/modal/browsingModal/instanceListModal/instanceListModal.html",
    directives: [InstanceListComponent]
})
export class InstanceListModal implements ICustomModalComponent {
    
    private selectedInstance;
    
    dialog: ModalDialogInstance;
    context: InstanceListModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <InstanceListModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedInstance);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
    }

}