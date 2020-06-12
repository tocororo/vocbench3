import { Component } from "@angular/core";
import { OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder, Modal } from "ngx-modialog/plugins/bootstrap";
import { Reference } from "../models/Configuration";
import { ResourceMetadataAssociation } from "../models/ResourceMetadata";
import { ResourceMetadataServices } from "../services/resourceMetadataServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { MetadataPatternEditorModal, MetadataPatternEditorModalData } from "./modals/metadataPatternEditorModal";
import { MetadataAssociationEditorModalData, MetadataAssociationEditorModal } from "./modals/metadataAssociationEditorModal";

@Component({
    selector: "resource-metadata-component",
    templateUrl: "./resourceMetadataComponent.html",
    host: { class: "pageComponent" }
})
export class ResourceMetadataComponent {

    private patterns: Reference[];
    private selectedPattern: Reference;

    private associations: ResourceMetadataAssociation[];
    private selectedAssociation: ResourceMetadataAssociation;

    //Authorizations
    private createPatternAuthorized: boolean;
    private deletePatternAuthorized: boolean;
    private modifyPatternAuthorized: boolean;
    private createAssociationAuthorized: boolean;
    private deleteAssociationAuthorized: boolean;
    private modifyAssociationAuthorized: boolean;

    constructor(private resourceMetadataService: ResourceMetadataServices, private basicModals: BasicModalServices, private modal: Modal) { }

    ngOnInit() {
        //init authorizations
        this.createPatternAuthorized = true;
        this.deletePatternAuthorized = true;
        this.modifyPatternAuthorized = true;
        this.createAssociationAuthorized = true;
        this.modifyAssociationAuthorized = true;
        this.deleteAssociationAuthorized = true;

        this.initAssociations();
        this.initPatterns();
    }

    private initAssociations() {
        this.resourceMetadataService.listAssociations().subscribe(
            associations => {
                this.associations = associations;
                this.associations.sort((a1, a2) => {
                    if (a1.role == a2.role) { //in case of same role, sort by pattern reference
                        return a1.patternRef.localeCompare(a2.patternRef);
                    } else {
                        return a1.role.localeCompare(a2.role);
                    }
                });
                this.selectedAssociation = null;
            }
        );
    }

    private initPatterns() {
        this.resourceMetadataService.getPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs;
                this.patterns.sort((p1, p2) => p1.relativeReference.localeCompare(p2.relativeReference))
                this.selectedPattern = null;
            }
        );
    }

    /* PATTERNS */

    private createPattern() {
        this.openPatternEditor("Create metadata pattern").then(
            () => this.initPatterns(),
            () => {}
        );
    }

    private editPattern() {
        this.openPatternEditor("Edit metadata pattern", this.selectedPattern).then(
            () => this.initPatterns(),
            () => {}
        );
    }

    private deletePattern() {
        this.basicModals.confirm("Delete Metadata Pattern", "You are deleting the pattern " + this.selectedPattern.identifier + ". Are you sure?", "warning").then(
            () => {
                this.resourceMetadataService.deletePattern(this.selectedPattern.relativeReference).subscribe(
                    () => this.initPatterns()
                );
            },
            () => {}
        );
    }

    private openPatternEditor(title: string, pattern?: Reference) {
        var modalData = new MetadataPatternEditorModalData(title, pattern);
        const builder = new BSModalContextBuilder<MetadataPatternEditorModalData>(
            modalData, undefined, MetadataPatternEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').toJSON() };
        return this.modal.open(MetadataPatternEditorModal, overlayConfig).result;
    }

    /* ASSOCIATIONS */

    private createAssociation() {
        this.openAssociationEditor("Add association").then(
            () => this.initAssociations(),
            () => {}
        );
    }

    // private editAssociation() {}

    private deleteAssociation() {
        this.basicModals.confirm("Delete Metadata Association", "You are deleting the association between " + this.selectedAssociation.role + 
            " and " + this.selectedAssociation.patternRef + ". Are you sure?", "warning").then(
            () => {
                this.resourceMetadataService.deleteAssociation(this.selectedAssociation.ref).subscribe(
                    () => this.initAssociations()
                );
            },
            () => {}
        );
    }

    private openAssociationEditor(title: string) {
        var modalData = new MetadataPatternEditorModalData(title);
        const builder = new BSModalContextBuilder<MetadataAssociationEditorModalData>(
            modalData, undefined, MetadataAssociationEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(MetadataAssociationEditorModal, overlayConfig).result;
    }

}