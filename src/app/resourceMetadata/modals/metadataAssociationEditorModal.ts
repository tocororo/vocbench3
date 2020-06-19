import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { PatternStruct, ResourceMetadataAssociation, ResourceMetadataUtils } from "../../models/ResourceMetadata";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class MetadataAssociationEditorModalData extends BSModalContext {
    constructor(public title: string, public existingAssociations: ResourceMetadataAssociation[]) {
        super();
    }
}

@Component({
    selector: "metadata-assosiaction-editor-modal",
    templateUrl: "./metadataAssociationEditorModal.html",
})
export class MetadataAssociationEditorModal implements ModalComponent<MetadataAssociationEditorModalData> {
    context: MetadataAssociationEditorModalData;

    private patterns: PatternStruct[];
    private selectedPattern: PatternStruct;

    private roles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.undetermined, RDFResourceRolesEnum.annotationProperty, RDFResourceRolesEnum.cls,
        RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, RDFResourceRolesEnum.dataRange, 
        RDFResourceRolesEnum.datatypeProperty, RDFResourceRolesEnum.individual, RDFResourceRolesEnum.limeLexicon, 
        RDFResourceRolesEnum.objectProperty, RDFResourceRolesEnum.ontolexForm, RDFResourceRolesEnum.ontolexLexicalEntry,
        RDFResourceRolesEnum.ontolexLexicalSense, RDFResourceRolesEnum.ontology, RDFResourceRolesEnum.ontologyProperty,
        RDFResourceRolesEnum.property, RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.skosOrderedCollection, 
        RDFResourceRolesEnum.xLabel]
    private resourceTypes: RoleStruct[];
    private selectedType: RoleStruct;


    constructor(public dialog: DialogRef<MetadataAssociationEditorModalData>, private resourceMetadataService: ResourceMetadataServices,
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.resourceTypes = this.roles.map(r => { 
            return { role: r, show: ResourceUtils.getResourceRoleLabel(r) }
        })
        this.resourceMetadataService.getPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs.map(ref => ResourceMetadataUtils.convertReferenceToPatternStruct(ref));
            }
        )
    }

    private isDataValid(): boolean {
        return this.selectedPattern != null && this.selectedType != null;
    }

    ok() {
        //check if the same association already exists
        if (this.context.existingAssociations.some(a => a.role == this.selectedType.role && a.pattern.reference == this.selectedPattern.reference)) {
            this.basicModals.alert("Association already existing", "An association between the same resource type and pattern already exists.", "warning");
            return;
        }
        this.resourceMetadataService.addAssociation(this.selectedType.role, this.selectedPattern.reference).subscribe(
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