import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { Reference } from "../../models/Configuration";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { ResourceUtils } from "../../utils/ResourceUtils";

export class MetadataAssociationEditorModalData extends BSModalContext {
    constructor(public title: string) {
        super();
    }
}

@Component({
    selector: "metadata-assosiaction-editor-modal",
    templateUrl: "./metadataAssociationEditorModal.html",
})
export class MetadataAssociationEditorModal implements ModalComponent<MetadataAssociationEditorModalData> {
    context: MetadataAssociationEditorModalData;

    private patterns: Reference[];
    private selectedPattern: Reference;

    private roles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.annotationProperty, RDFResourceRolesEnum.cls,
        RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, RDFResourceRolesEnum.dataRange, 
        RDFResourceRolesEnum.datatypeProperty, RDFResourceRolesEnum.individual, RDFResourceRolesEnum.limeLexicon, 
        RDFResourceRolesEnum.objectProperty, RDFResourceRolesEnum.ontolexForm, RDFResourceRolesEnum.ontolexLexicalEntry,
        RDFResourceRolesEnum.ontolexLexicalSense, RDFResourceRolesEnum.ontology, RDFResourceRolesEnum.ontologyProperty,
        RDFResourceRolesEnum.property, RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.skosOrderedCollection, 
        RDFResourceRolesEnum.xLabel]
    private resourceTypes: RoleStruct[];
    private selectedType: RoleStruct;


    constructor(public dialog: DialogRef<MetadataAssociationEditorModalData>, private resourceMetadataService: ResourceMetadataServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.resourceTypes = this.roles.map(r => { 
            return { role: r, show: ResourceUtils.getResourceRoleLabel(r) }
        })
        this.resourceMetadataService.getPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs;
            }
        )
    }

    private isDataValid(): boolean {
        return this.selectedPattern != null && this.selectedType != null;
    }

    ok() {
        this.resourceMetadataService.addAssociation(this.selectedType.role, this.selectedPattern.relativeReference).subscribe(
            () => {
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }
}

interface RoleStruct {
    role: RDFResourceRolesEnum;
    show: string;
}