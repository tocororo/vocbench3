import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource} from '../../../../utils/ARTResources';

export class ClassIndividualTreeModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "class-individual-tree-modal",
    templateUrl: "./classIndividualTreeModal.html",
})
export class ClassIndividualTreeModal implements ModalComponent<ClassIndividualTreeModalData> {
    context: ClassIndividualTreeModalData;
    
    private selectedInstance: ARTURIResource;
    
    constructor(public dialog: DialogRef<ClassIndividualTreeModalData>) {
        this.context = dialog.context;
    }
    
    ok(event: Event) {
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