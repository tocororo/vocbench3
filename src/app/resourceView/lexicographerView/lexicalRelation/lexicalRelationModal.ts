import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { VBContext } from "src/app/utils/VBContext";
import { ResourcePickerConfig } from "src/app/widget/pickers/valuePicker/resourcePickerComponent";

@Component({
    selector: "lexical-relation-modal",
    templateUrl: "./lexicalRelationModal.html",
})
export class LexicalRelationModal {
    @Input() title: string;
    @Input() sourceEntity: ARTResource; //sense, entry or concept

    categories: ARTURIResource[];
    selectedCategory: ARTURIResource;
    targetEntity: ARTURIResource;
    undirectional: boolean = false;

    resourcePickerConfig: ResourcePickerConfig = {};
    
    constructor(private activeModal: NgbActiveModal, private ontolexService: OntoLexLemonServices) {}
    
    ngOnInit() {
        let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;

        let role: RDFResourceRolesEnum = this.sourceEntity.getRole();
        this.resourcePickerConfig = { roles: [role] }

        let getCategoriesFn: Observable<ARTURIResource[]>;
        if (role == RDFResourceRolesEnum.ontolexLexicalSense) {
            getCategoriesFn = this.ontolexService.getSenseRelationCategories(lexicon);
        } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            getCategoriesFn = this.ontolexService.getLexicalRelationCategories(lexicon);
        } else if (role == RDFResourceRolesEnum.concept) {
            getCategoriesFn = this.ontolexService.getConceptualRelationCategories(lexicon);
        }

        getCategoriesFn.subscribe(
            categories => {
                this.categories = categories;
            }
        );
    }
    
    isOkClickable(): boolean {
        return (this.selectedCategory != null && this.targetEntity != null);
    }

    ok() {
        let returnData: LexicoRelationModalReturnData = {
            category: this.selectedCategory,
            target: this.targetEntity,
            undirectional: this.undirectional
        };
        this.activeModal.close(returnData);
    }
    
    cancel() {
        this.activeModal.dismiss();
    }

}

export interface LexicoRelationModalReturnData {
    category: ARTURIResource;
    target: ARTResource;
    undirectional: boolean;
}