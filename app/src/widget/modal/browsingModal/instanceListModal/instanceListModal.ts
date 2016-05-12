import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource} from '../../../../utils/ARTResources';
import {InstanceListComponent} from '../../../../owl/instanceList/instanceListComponent';

export class InstanceListModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public cls: ARTURIResource) {
        super();
    }
}

@Component({
    selector: "instance-list-modal",
    templateUrl: "app/src/widget/modal/browsingModal/instanceListModal/instanceListModal.html",
    directives: [InstanceListComponent]
})
export class InstanceListModal implements ModalComponent<InstanceListModalData> {
    context: InstanceListModalData;
    
    private selectedInstance;
    
    constructor(public dialog: DialogRef<InstanceListModalData>) {
        this.context = dialog.context;
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