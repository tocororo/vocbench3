import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogRecord2, DatasetNature } from 'src/app/models/Metadata';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { MdrTreeContext } from './mdrTreeComponent';

@Component({
    selector: "mdr-tree-modal",
    templateUrl: "./mdrTreeModal.html",
})
export class MetadataRegistryTreeModal {

    @Input() title: string;
    @Input() context: MdrTreeContext;

    selectedRecord: CatalogRecord2;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices) { }

    ok() {
        if (this.selectedRecord.dataset.nature == DatasetNature.ABSTRACT) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "You need to select a concrete dataset" }, ModalType.warning);
            return;
        }
        this.activeModal.close(this.selectedRecord);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}
