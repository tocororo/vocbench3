import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { PatternStruct, ResourceMetadataAssociation, ResourceMetadataUtils } from "../../models/ResourceMetadata";
import { ResourceMetadataServices } from "../../services/resourceMetadataServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "metadata-assosiaction-editor-modal",
    templateUrl: "./metadataAssociationEditorModal.html",
})
export class MetadataAssociationEditorModal {
    @Input() title: string;
    @Input() existingAssociations: ResourceMetadataAssociation[];

    patterns: PatternStruct[];
    private selectedPattern: PatternStruct;

    private roles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.undetermined, RDFResourceRolesEnum.annotationProperty, RDFResourceRolesEnum.cls,
        RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, RDFResourceRolesEnum.dataRange, 
        RDFResourceRolesEnum.datatypeProperty, RDFResourceRolesEnum.individual, RDFResourceRolesEnum.limeLexicon, 
        RDFResourceRolesEnum.objectProperty, RDFResourceRolesEnum.ontolexForm, RDFResourceRolesEnum.ontolexLexicalEntry,
        RDFResourceRolesEnum.ontolexLexicalSense, RDFResourceRolesEnum.ontology, RDFResourceRolesEnum.ontologyProperty,
        RDFResourceRolesEnum.property, RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.skosOrderedCollection, 
        RDFResourceRolesEnum.xLabel]
    resourceTypes: RoleStruct[];
    private selectedType: RoleStruct;


    constructor(public activeModal: NgbActiveModal, private resourceMetadataService: ResourceMetadataServices,
        private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.resourceTypes = this.roles.map(r => { 
            return { role: r, show: ResourceUtils.getResourceRoleLabel(r, true) }
        })
        this.resourceMetadataService.getPatternIdentifiers().subscribe(
            refs => {
                this.patterns = refs.map(ref => ResourceMetadataUtils.convertReferenceToPatternStruct(ref));
            }
        )
    }

    isDataValid(): boolean {
        return this.selectedPattern != null && this.selectedType != null;
    }

    ok() {
        //check if the same association already exists
        if (this.existingAssociations.some(a => a.role == this.selectedType.role && a.pattern.reference == this.selectedPattern.reference)) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.ALREADY_EXISTING_METADATA_ASSOCIATION"}, ModalType.warning);
            return;
        }
        this.resourceMetadataService.addAssociation(this.selectedType.role, this.selectedPattern.reference).subscribe(
            () => {
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }
}

interface RoleStruct {
    role: RDFResourceRolesEnum;
    show: string;
}