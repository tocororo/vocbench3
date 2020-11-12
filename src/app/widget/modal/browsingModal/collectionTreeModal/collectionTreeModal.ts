import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

@Component({
    selector: "collection-tree-modal",
    templateUrl: "./collectionTreeModal.html",
})
export class CollectionTreeModal {
    @Input() title: string;
    @Input() projectCtx?: ProjectContext;
    
    selectedCollection: ARTURIResource;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    ok() {
        this.activeModal.close(this.selectedCollection);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
    onCollectionSelected(collection: ARTURIResource) {
        this.selectedCollection = collection;
    }

}