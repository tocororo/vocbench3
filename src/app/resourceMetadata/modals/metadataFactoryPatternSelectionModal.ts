import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { PatternStruct, ResourceMetadataUtils } from "../../models/ResourceMetadata";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { MetadataPatternEditorModal } from "./metadataPatternEditorModal";

@Component({
    selector: "metadata-factory-pattern-modal",
    templateUrl: "./metadataFactoryPatternSelectionModal.html",
})
export class MetadataFactoryPatternSelectionModal {
    @Input() title: string;

    patterns: PatternStruct[];
    selectedPattern: PatternStruct;

    constructor(public activeModal: NgbActiveModal, private resourceMetadataService: ResourceMetadataServices,
        private modalService: NgbModal) {
    }

    ngOnInit() {
        this.resourceMetadataService.getFactoryPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs.map(ref => ResourceMetadataUtils.convertReferenceToPatternStruct(ref));
            }
        );
    }

    showPattern() {
        const modalRef: NgbModalRef = this.modalService.open(MetadataPatternEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = "Metadata Pattern";
		modalRef.componentInstance.existingPatterns = [];
        modalRef.componentInstance.ref = this.selectedPattern.reference;
        modalRef.componentInstance.readOnly = true;
        return modalRef.result;
    }

    isDataValid(): boolean {
        return this.selectedPattern != null;
    }

    ok() {
        this.activeModal.close(this.selectedPattern);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}