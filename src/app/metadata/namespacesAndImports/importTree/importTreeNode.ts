import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { ImportType, OntologyImport } from "../../../models/Metadata";
import { MetadataServices } from "../../../services/metadataServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { ImportOntologyModal, ImportOntologyReturnData, RepairFromLocalFileData, RepairFromWebData, RepairFromWebToMirrorData } from "../importOntologyModal";

@Component({
    selector: "import-tree-node",
    templateUrl: "./importTreeNode.html",
})
export class ImportTreeNodeComponent {
    @Input() import: OntologyImport;
    @Output() nodeRemoved = new EventEmitter<OntologyImport>();
    @Output() update = new EventEmitter();

    open: boolean = true;

    constructor(private metadataService: MetadataServices, private modalService: NgbModal) { }

    removeImport() {
        this.nodeRemoved.emit(this.import);
    }

    repairFromLocalFile() {
        this.openImportModal("Repair failed import from local file", ImportType.fromLocalFile).then(
            (data: RepairFromLocalFileData) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.metadataService.getFromLocalFile(data.baseURI, data.localFile, data.transitiveImportAllowance, data.mirrorFile).subscribe(
                    () => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    repairFromWeb() {
        this.openImportModal("Repair failed import from web", ImportType.fromWeb).then(
            (data: RepairFromWebData) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.metadataService.downloadFromWeb(data.baseURI, data.transitiveImportAllowance, data.altURL, data.rdfFormat).subscribe(
                    () => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    repairFromWebToMirror() {
        this.openImportModal("Repair failed import from web to mirror", ImportType.fromWebToMirror).then(
            (data: RepairFromWebToMirrorData) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.metadataService.downloadFromWebToMirror(
                    data.baseURI, data.mirrorFile, data.transitiveImportAllowance, data.altURL, data.rdfFormat).subscribe(
                    () => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    /**
     * Opens a modal to import an ontology
     * @param title the title of the modal
     * @param importType tells the type of the import. On this parameter depends the input fields of the modal.
     * Available values: fromWeb, fromWebToMirror, fromLocalFile, fromOntologyMirror
     * @return returned object depends on importType. If importType is:
     * fromWeb) object contains "baseURI", "altURL" and "rdfFormat";
     * fromWebToMirror) object contains "baseURI", "mirrorFile", "altURL" and "rdfFormat";
     * fromLocalFile) object contains "baseURI", "localFile" and "mirrorFile";
     * fromOntologyMirror) mirror object contains "namespace" and "file".
     */
    private openImportModal(title: string, importType: ImportType): Promise<ImportOntologyReturnData> {
        const modalRef: NgbModalRef = this.modalService.open(ImportOntologyModal, new ModalOptions());
        modalRef.componentInstance.title = title;
		modalRef.componentInstance.importType = importType;
		modalRef.componentInstance.baseUriInput = this.import.id;
        return modalRef.result;
    }

    onNodeRemoved(node: OntologyImport) {
        this.nodeRemoved.emit(node);
    }

    onUpdate() {
        this.update.emit();
    }

    isDeleteImportAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRemoveImport);
    }

}