import { Component } from "@angular/core";
import { OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder, Modal } from "ngx-modialog/plugins/bootstrap";
import { PatternStruct, ResourceMetadataAssociation, ResourceMetadataUtils } from "../models/ResourceMetadata";
import { ResourceMetadataServices } from "../services/resourceMetadataServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../utils/ResourceUtils";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ImportPatternModal, ImportPatternModalData } from "./modals/importPatternModal";
import { MetadataAssociationEditorModal, MetadataAssociationEditorModalData } from "./modals/metadataAssociationEditorModal";
import { MetadataPatternEditorModal, MetadataPatternEditorModalData } from "./modals/metadataPatternEditorModal";
import { MetadataPatternLibraryModal, MetadataPatternLibraryModalData } from "./modals/metadataPatternLibraryModal";
import { VBActionsEnum } from "../utils/VBActions";

@Component({
    selector: "resource-metadata-component",
    templateUrl: "./resourceMetadataComponent.html",
    host: { class: "pageComponent" }
})
export class ResourceMetadataComponent {

    private patterns: PatternStruct[];
    private selectedPattern: PatternStruct;

    private associations: ResourceMetadataAssociation[];
    private selectedAssociation: ResourceMetadataAssociation;

    //Authorizations
    private createPatternAuthorized: boolean;
    private deletePatternAuthorized: boolean;
    private modifyPatternAuthorized: boolean;
    private createAssociationAuthorized: boolean;
    private deleteAssociationAuthorized: boolean;

    constructor(private resourceMetadataService: ResourceMetadataServices, private basicModals: BasicModalServices, private modal: Modal) { }

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

    private createPattern() {
        this.openPatternEditor("Create Metadata Pattern").then(
            () => this.initPatterns(),
            () => {}
        );
    }

    private editPattern() {
        this.openPatternEditor("Edit Metadata Pattern", this.selectedPattern.reference).then(
            () => this.initPatterns(),
            () => {}
        );
    }

    private deletePattern() {
        let patternUsed: boolean = this.associations.some(a => a.pattern.reference == this.selectedPattern.reference);
        let message: string = "You are deleting the pattern " + this.selectedPattern.name + ".\n";
        if (patternUsed) {
            message += "Note: the Metadata Pattern is used in one (or more) association. By deleting the pattern, the association(s) will be deleted as well.\n"
        }
        message += "Do you want to continue?";
        this.basicModals.confirm("Delete Metadata Pattern", message, "warning").then(
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

    private clonePattern() {
        this.basicModals.prompt("Clone Metadata Pattern", { value: "Name", tooltip: "The name of the new pattern" }).then(
            (patternName: string) => {
                if (this.patterns.some(p => p.name == patternName)) {
                    this.basicModals.alert("Already existing Pattern", "A Metadata Pattern with the name '" + patternName + "' already exists", "warning");
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

    private importPattern() {
        let modalData = new ImportPatternModalData("Import Metadata Pattern", this.patterns);
        const builder = new BSModalContextBuilder<ImportPatternModalData>(
            modalData, undefined, ImportPatternModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(ImportPatternModal, overlayConfig).result.then(
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

    private exportPattern() {
        this.resourceMetadataService.exportPattern(this.selectedPattern.reference).subscribe(
            pattern => {
                let url = window.URL.createObjectURL(pattern);
                this.basicModals.downloadLink("Export Metadata Pattern", null, url, this.selectedPattern.name + ".cfg");
            }
        )
    }

    private importPatternFromLibrary() {
        this.openPatterLibrary("Import shared Metadata Pattern").then(
            pattern => {
                this.initPatterns();
            },
            () => {}
        )
    }

    private sharePastorePatternInLibraryttern() {
        this.openPatterLibrary("Share Metadata Pattern", this.selectedPattern);
    }

    private openPatternEditor(title: string, patternRef?: string) {
        let readonly: boolean = (patternRef != null) ? patternRef.startsWith("factory") : false;
        var modalData = new MetadataPatternEditorModalData(title, this.patterns, patternRef, readonly);
        const builder = new BSModalContextBuilder<MetadataPatternEditorModalData>(
            modalData, undefined, MetadataPatternEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').toJSON() };
        return this.modal.open(MetadataPatternEditorModal, overlayConfig).result;
    }

    private openPatterLibrary(title: string, patternToShare?: PatternStruct) {
        var modalData = new MetadataPatternLibraryModalData(title, patternToShare, this.patterns);
        const builder = new BSModalContextBuilder<MetadataPatternLibraryModalData>(
            modalData, undefined, MetadataPatternLibraryModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(MetadataPatternLibraryModal, overlayConfig).result;
        
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

    private createAssociation() {
        this.openAssociationEditor("Add Metadata Association").then(
            () => this.initAssociations(),
            () => {}
        );
    }

    private deleteAssociation() {
        this.basicModals.confirm("Delete Metadata Association", "You are deleting the association between '" + this.selectedAssociation.role + 
            "' and '" + this.selectedAssociation.pattern.reference + "'. Are you sure?", "warning").then(
            () => {
                this.resourceMetadataService.deleteAssociation(this.selectedAssociation.ref).subscribe(
                    () => this.initAssociations()
                );
            },
            () => {}
        );
    }

    private openAssociationEditor(title: string) {
        var modalData = new MetadataAssociationEditorModalData(title, this.associations);
        const builder = new BSModalContextBuilder<MetadataAssociationEditorModalData>(
            modalData, undefined, MetadataAssociationEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(MetadataAssociationEditorModal, overlayConfig).result;
    }

}