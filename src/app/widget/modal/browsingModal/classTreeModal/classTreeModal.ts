import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource} from '../../../../utils/ARTResources';

export class ClassTreeModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "class-tree-modal",
    templateUrl: "./classTreeModal.html",
})
export class ClassTreeModal implements ModalComponent<ClassTreeModalData> {
    context: ClassTreeModalData;
    
    private selectedClass;
    
    constructor(public dialog: DialogRef<ClassTreeModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedClass);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onClassSelected(cls: ARTURIResource) {
        this.selectedClass = cls;
    }

}