import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

export class SchemeListModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public projectCtx?: ProjectContext) {
        super();
    }
}

@Component({
    selector: "scheme-list-modal",
    templateUrl: "./schemeListModal.html",
})
export class SchemeListModal implements ModalComponent<SchemeListModalData> {
    context: SchemeListModalData;
    
    private selectedScheme: ARTURIResource;
    
    constructor(public dialog: DialogRef<SchemeListModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedScheme);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onSchemeSelected(scheme: ARTURIResource) {
        this.selectedScheme = scheme;
    }

}