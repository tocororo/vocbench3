import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

export class ClassTreeModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public roots: ARTURIResource[] = null) {
        super();
    }
}

@Component({
    selector: "class-tree-modal",
    templateUrl: "./classTreeModal.html",
})
export class ClassTreeModal implements ModalComponent<ClassTreeModalData> {
    context: ClassTreeModalData;
    
    private selectedClass: ARTURIResource;

    constructor(public dialog: DialogRef<ClassTreeModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok(event: Event) {
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