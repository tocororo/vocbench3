import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

export class CollectionTreeModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "collection-tree-modal",
    templateUrl: "./collectionTreeModal.html",
})
export class CollectionTreeModal implements ModalComponent<CollectionTreeModalData> {
    context: CollectionTreeModalData;
    
    private selectedCollection: ARTURIResource;
    
    constructor(public dialog: DialogRef<CollectionTreeModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedCollection);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onCollectionSelected(collection: ARTURIResource) {
        this.selectedCollection = collection;
    }

}