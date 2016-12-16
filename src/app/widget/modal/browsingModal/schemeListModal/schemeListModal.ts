import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource} from '../../../../utils/ARTResources';

export class SchemeListModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
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
    
    constructor(public dialog: DialogRef<SchemeListModalData>) {
        this.context = dialog.context;
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