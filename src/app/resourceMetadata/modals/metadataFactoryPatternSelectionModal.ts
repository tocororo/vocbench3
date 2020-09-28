import { Component } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { PatternStruct, ResourceMetadataUtils } from "../../models/ResourceMetadata";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { MetadataPatternEditorModal, MetadataPatternEditorModalData } from "./metadataPatternEditorModal";

export class MetadataFactoryPatternSelectionModalData extends BSModalContext {
    /**
     * 
     * @param title 
     * @param existingAssociations 
     * @param onlyFactory if true, initializes the list of the pattern with the only factory-provided
     */
    constructor(public title: string) {
        super();
    }
}

@Component({
    selector: "metadata-factory-pattern-modal",
    templateUrl: "./metadataFactoryPatternSelectionModal.html",
})
export class MetadataFactoryPatternSelectionModal implements ModalComponent<MetadataFactoryPatternSelectionModalData> {
    context: MetadataFactoryPatternSelectionModalData;

    private patterns: PatternStruct[];
    private selectedPattern: PatternStruct;

    constructor(public dialog: DialogRef<MetadataFactoryPatternSelectionModalData>, private resourceMetadataService: ResourceMetadataServices,
        private modal: Modal) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.resourceMetadataService.getFactoryPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs.map(ref => ResourceMetadataUtils.convertReferenceToPatternStruct(ref));
            }
        );
    }

    private showPattern() {
        var modalData = new MetadataPatternEditorModalData("Metadata Pattern", [], this.selectedPattern.reference, true);
        const builder = new BSModalContextBuilder<MetadataPatternEditorModalData>(
            modalData, undefined, MetadataPatternEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').toJSON() };
        return this.modal.open(MetadataPatternEditorModal, overlayConfig).result;
    }

    private isDataValid(): boolean {
        return this.selectedPattern != null;
    }

    ok() {
        this.dialog.close(this.selectedPattern);
    }

    cancel() {
        this.dialog.dismiss();
    }
}