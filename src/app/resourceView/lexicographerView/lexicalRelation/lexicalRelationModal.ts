import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { Vartrans } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { VBContext } from "src/app/utils/VBContext";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { ResourcePickerConfig } from "src/app/widget/pickers/valuePicker/resourcePickerComponent";

@Component({
    selector: "lexical-relation-modal",
    templateUrl: "./lexicalRelationModal.html",
})
export class LexicalRelationModal {
    @Input() title: string;
    @Input() sourceEntity: ARTResource; //entry, sense or concept
    @Input() translation: boolean; //if true this modal is used to add a translation (only for entry and sense)

    categories: ARTURIResource[];
    selectedCategory: ARTURIResource;
    targetEntity: ARTURIResource;
    undirectional: boolean = false;
    translationSet: ARTResource;

    resourcePickerConfig: ResourcePickerConfig = {};
    
    constructor(private activeModal: NgbActiveModal, private ontolexService: OntoLexLemonServices, private browsingModals: BrowsingModalServices) {}
    
    ngOnInit() {
        let role: RDFResourceRolesEnum = this.sourceEntity.getRole();
        this.resourcePickerConfig = { roles: [role] }

        if (this.translation) {
            this.categories = [Vartrans.translatableAs];
            this.selectedCategory = this.categories[0];
        } else {
            let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
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
    }

    pickTranslationSet() {
        this.browsingModals.browseTranslationSet({key:"DATA.ACTIONS.SELECT_TRANSLATION_SET"}, true, true).then(
            res => {
                this.translationSet = res;
            }
        )
    }
    
    isOkClickable(): boolean {
        return (this.selectedCategory != null && this.targetEntity != null);
    }

    ok() {
        let returnData: LexicoRelationModalReturnData = {
            category: this.selectedCategory,
            target: this.targetEntity,
            undirectional: this.undirectional,
            tranlsationSet: this.translation ? this.translationSet: null
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
    tranlsationSet?: ARTResource; //in case of tranlsation
}