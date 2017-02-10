import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource} from '../../../../models/ARTResources';

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
    
    constructor(public dialog: DialogRef<CollectionTreeModalData>) {
        this.context = dialog.context;
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