import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { PatternStruct, ResourceMetadataAssociation, ResourceMetadataUtils } from "../models/ResourceMetadata";
import { ResourceMetadataServices } from "../services/resourceMetadataServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../utils/ResourceUtils";
import { VBActionsEnum } from "../utils/VBActions";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType, TextOrTranslation, Translation } from '../widget/modal/Modals';
import { ImportPatternModal } from "./modals/importPatternModal";
import { MetadataAssociationEditorModal } from "./modals/metadataAssociationEditorModal";
import { MetadataPatternEditorModal } from "./modals/metadataPatternEditorModal";
import { MetadataPatternLibraryModal } from "./modals/metadataPatternLibraryModal";

@Component({
    selector: "resource-metadata-component",
    templateUrl: "./resourceMetadataComponent.html",
    host: { class: "pageComponent" }
})
export class ResourceMetadataComponent {

    patterns: PatternStruct[];
    selectedPattern: PatternStruct;

    associations: ResourceMetadataAssociation[];
    selectedAssociation: ResourceMetadataAssociation;

    //Authorizations
    createPatternAuthorized: boolean;
    deletePatternAuthorized: boolean;
    modifyPatternAuthorized: boolean;
    createAssociationAuthorized: boolean;
    deleteAssociationAuthorized: boolean;

    constructor(private resourceMetadataService: ResourceMetadataServices, private basicModals: BasicModalServices, private modalService: NgbModal,
        private translateService: TranslateService) { }

    ngOnInit() {
        //init authorizations
        this.createPatternAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourceMetadataPatternCreate);
        this.deletePatternAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourceMetadataPatternDelete);
        this.modifyPatternAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourceMetadataPatternUpdate);
        this.createAssociationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourceMetadataAssociationCreate);
        this.deleteAssociationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourceMetadataAssociationDelete);

        this.initAssociations();
        this.initPatterns();
    }


    /* PATTERNS */

    private initPatterns() {
        this.resourceMetadataService.getPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs.map(ref => ResourceMetadataUtils.convertReferenceToPatternStruct(ref));
                this.selectedPattern = null;
            }
        );
    }

    createPattern() {
        this.openPatternEditor({key:"RESOURCE_METADATA.ACTIONS.CREATE_METADATA_PATTERN"}).then(
            () => this.initPatterns(),
            () => {}
        );
    }

    editPattern() {
        this.openPatternEditor({key:"RESOURCE_METADATA.ACTIONS.EDIT_METADATA_PATTERN"}, this.selectedPattern.reference).then(
            () => this.initPatterns(),
            () => {}
        );
    }

    deletePattern() {
        let patternUsed: boolean = this.associations.some(a => a.pattern.reference == this.selectedPattern.reference);
        let message: string = this.translateService.instant("MESSAGES.DELETE_METADATA_PATTERN_CONFIRM.DELETING") + ".\n";
        if (patternUsed) {
            message += this.translateService.instant("MESSAGES.DELETE_METADATA_PATTERN_CONFIRM.USED_IN_ASSOCIATION") + ".\n";
        }
        message += this.translateService.instant("MESSAGES.DELETE_METADATA_PATTERN_CONFIRM.CONTINUE");
        this.basicModals.confirm({key:"RESOURCE_METADATA.ACTIONS.DELETE_METADATA_PATTERN"}, message, ModalType.warning).then(
            () => {
                this.resourceMetadataService.deletePattern(this.selectedPattern.reference).subscribe(
                    () => {
                        this.initPatterns();
                        if (patternUsed) {
                            this.initAssociations();
                        }
                    }
                );
            },
            () => {}
        );
    }

    clonePattern() {
        this.basicModals.prompt({key:"RESOURCE_METADATA.ACTIONS.CLONE_METADATA_PATTERN"}, { value: "Name", tooltip: "The name of the new pattern" }).then(
            (patternName: string) => {
                if (this.patterns.some(p => p.name == patternName)) {
                    this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.ALREADY_EXISTING_METADATA_PATTERN_NAME"}, ModalType.warning);
                    return;
                }
                this.resourceMetadataService.clonePattern(this.selectedPattern.reference, patternName).subscribe(
                    () => {
                        this.initPatterns();
                    }
                );
            },
            () => { }
        );
    }

    importPattern() {
        const modalRef: NgbModalRef = this.modalService.open(ImportPatternModal, new ModalOptions());
        modalRef.componentInstance.title = "Import Metadata Pattern";
		modalRef.componentInstance.existingPatterns = this.patterns;
        modalRef.result.then(
            (data: { file: File, name: string }) => {
                this.resourceMetadataService.importPattern(data.file, data.name).subscribe(
                    () => {
                        this.initPatterns();
                    }
                )
            },
            () => { }
        );
    }

    exportPattern() {
        this.resourceMetadataService.exportPattern(this.selectedPattern.reference).subscribe(
            pattern => {
                let url = window.URL.createObjectURL(pattern);
                this.basicModals.downloadLink({ key: "RESOURCE_METADATA.ACTIONS.EXPORT_METADATA_PATTERN" }, null, url, this.selectedPattern.name + ".cfg");
            }
        )
    }

    importPatternFromLibrary() {
        this.openPatterLibrary({key:"RESOURCE_METADATA.ACTIONS.IMPORT_SHARED_METADATA_PATTERN"}).then(
            pattern => {
                this.initPatterns();
            },
            () => {}
        )
    }

    storePatternInLibrary() {
        this.openPatterLibrary({key:"RESOURCE_METADATA.ACTIONS.SHARE_METADATA_PATTERN"}, this.selectedPattern);
    }

    private openPatternEditor(title: Translation, patternRef?: string) {
        let readonly: boolean = (patternRef != null) ? patternRef.startsWith("factory") : false;
        const modalRef: NgbModalRef = this.modalService.open(MetadataPatternEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
		modalRef.componentInstance.existingPatterns = this.patterns;
        modalRef.componentInstance.ref = patternRef;
        modalRef.componentInstance.readOnly = readonly;
        return modalRef.result;
    }

    private openPatterLibrary(title: Translation, patternToShare?: PatternStruct) {
        const modalRef: NgbModalRef = this.modalService.open(MetadataPatternLibraryModal, new ModalOptions());
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
		modalRef.componentInstance.patternToShare = patternToShare;
		modalRef.componentInstance.existinPatterns = this.patterns;
        return modalRef.result;
    }

    /* ASSOCIATIONS */

    private initAssociations() {
        this.resourceMetadataService.listAssociations().subscribe(
            associations => {
                this.associations = associations;
                this.associations.forEach(a => {
                    a['roleLabel'] = ResourceUtils.getResourceRoleLabel(a.role, true)
                })
                this.selectedAssociation = null;
            }
        );
    }

    createAssociation() {
        this.openAssociationEditor({key:"RESOURCE_METADATA.ACTIONS.CREATE_METADATA_ASSOCIATION"}).then(
            () => this.initAssociations(),
            () => {}
        );
    }

    deleteAssociation() {
        this.basicModals.confirm({key:"RESOURCE_METADATA.ACTIONS.DELETE_METADATA_ASSOCIATION"}, {key:"MESSAGES.DELETE_METADATA_PATTERN_ASSOCIATION_CONFIRM"}, ModalType.warning).then(
            () => {
                this.resourceMetadataService.deleteAssociation(this.selectedAssociation.ref).subscribe(
                    () => this.initAssociations()
                );
            },
            () => {}
        );
    }

    private openAssociationEditor(title: Translation) {
        const modalRef: NgbModalRef = this.modalService.open(MetadataAssociationEditorModal, new ModalOptions());
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
		modalRef.componentInstance.existingAssociations = this.associations;
        return modalRef.result;
    }

}