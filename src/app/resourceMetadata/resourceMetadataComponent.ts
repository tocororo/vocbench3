import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PatternStruct, ResourceMetadataAssociation, ResourceMetadataUtils } from "../models/ResourceMetadata";
import { ResourceMetadataServices } from "../services/resourceMetadataServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../utils/ResourceUtils";
import { VBActionsEnum } from "../utils/VBActions";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from '../widget/modal/Modals';
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

    constructor(private resourceMetadataService: ResourceMetadataServices, private basicModals: BasicModalServices, private modalService: NgbModal) { }

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
        this.openPatternEditor("Create Metadata Pattern").then(
            () => this.initPatterns(),
            () => {}
        );
    }

    editPattern() {
        this.openPatternEditor("Edit Metadata Pattern", this.selectedPattern.reference).then(
            () => this.initPatterns(),
            () => {}
        );
    }

    deletePattern() {
        let patternUsed: boolean = this.associations.some(a => a.pattern.reference == this.selectedPattern.reference);
        let message: string = "You are deleting the pattern " + this.selectedPattern.name + ".\n";
        if (patternUsed) {
            message += "Note: the Metadata Pattern is used in one (or more) association. By deleting the pattern, the association(s) will be deleted as well.\n"
        }
        message += "Do you want to continue?";
        this.basicModals.confirm("Delete Metadata Pattern", message, ModalType.warning).then(
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
        this.basicModals.prompt("Clone Metadata Pattern", { value: "Name", tooltip: "The name of the new pattern" }).then(
            (patternName: string) => {
                if (this.patterns.some(p => p.name == patternName)) {
                    this.basicModals.alert("Already existing Pattern", "A Metadata Pattern with the name '" + patternName + "' already exists", ModalType.warning);
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
                this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_METADATA_PATTERN" }, null, url, this.selectedPattern.name + ".cfg");
            }
        )
    }

    importPatternFromLibrary() {
        this.openPatterLibrary("Import shared Metadata Pattern").then(
            pattern => {
                this.initPatterns();
            },
            () => {}
        )
    }

    storePatternInLibrary() {
        this.openPatterLibrary("Share Metadata Pattern", this.selectedPattern);
    }

    private openPatternEditor(title: string, patternRef?: string) {
        let readonly: boolean = (patternRef != null) ? patternRef.startsWith("factory") : false;
        const modalRef: NgbModalRef = this.modalService.open(MetadataPatternEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = title;
		modalRef.componentInstance.existingPatterns = this.patterns;
        modalRef.componentInstance.ref = patternRef;
        modalRef.componentInstance.readOnly = readonly;
        return modalRef.result;
    }

    private openPatterLibrary(title: string, patternToShare?: PatternStruct) {
        const modalRef: NgbModalRef = this.modalService.open(MetadataPatternLibraryModal, new ModalOptions());
        modalRef.componentInstance.title = title;
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
        this.openAssociationEditor("Add Metadata Association").then(
            () => this.initAssociations(),
            () => {}
        );
    }

    deleteAssociation() {
        this.basicModals.confirm("Delete Metadata Association", "You are deleting the association between '" + this.selectedAssociation.role + 
            "' and '" + this.selectedAssociation.pattern.reference + "'. Are you sure?", ModalType.warning).then(
            () => {
                this.resourceMetadataService.deleteAssociation(this.selectedAssociation.ref).subscribe(
                    () => this.initAssociations()
                );
            },
            () => {}
        );
    }

    private openAssociationEditor(title: string) {
        const modalRef: NgbModalRef = this.modalService.open(MetadataAssociationEditorModal, new ModalOptions());
        modalRef.componentInstance.title = title;
		modalRef.componentInstance.existingAssociations = this.associations;
        return modalRef.result;
    }

}