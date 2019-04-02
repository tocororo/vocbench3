import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

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
    
    constructor(public dialog: DialogRef<ClassIndividualTreeModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
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