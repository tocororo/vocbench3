import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { Lexinfo, Vartrans } from "src/app/models/Vocabulary";
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
    @Input() sourceEntity: ARTResource; //entry or sense
    @Input() translation: boolean; //if true this modal is used to add a translation

    categories: ARTURIResource[];
    selectedCategory: ARTURIResource;
    targetEntity: ARTURIResource;
    undirectional: boolean = false;
    translationSet: ARTResource;

    relationTypes: { reified: boolean, translationKey: string }[] = [
        { reified: true, translationKey: "COMMONS.REIFIED" },
        { reified: false, translationKey: "COMMONS.PLAIN" }
    ];
    reified: boolean = true;

    resourcePickerConfig: ResourcePickerConfig = {};

    constructor(private activeModal: NgbActiveModal, private ontolexService: OntoLexLemonServices, private browsingModals: BrowsingModalServices) { }

    ngOnInit() {
        let role: RDFResourceRolesEnum = this.sourceEntity.getRole();
        this.resourcePickerConfig = { roles: [role] };

        if (this.translation) {
            if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
                this.categories = [Vartrans.translatableAs];
                //the relation "translation" between entry can only be plain
                this.relationTypes = this.relationTypes.filter(t => !t.reified);
                this.reified = false;
            } else if (role == RDFResourceRolesEnum.ontolexLexicalSense) {
                this.categories = [Lexinfo.translation];
            }
            this.selectedCategory = this.categories[0];
        } else {
            let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
            let getCategoriesFn: Observable<ARTURIResource[]>;
            if (role == RDFResourceRolesEnum.ontolexLexicalSense) {
                getCategoriesFn = this.ontolexService.getSenseRelationCategories(lexicon);
            } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
                getCategoriesFn = this.ontolexService.getLexicalRelationCategories(lexicon);
            }
            getCategoriesFn.subscribe(
                categories => {
                    this.categories = categories;
                    this.categories.sort((c1, c2) => c1.getLocalName().toLocaleLowerCase().localeCompare(c2.getLocalName().toLocaleLowerCase()));
                }
            );
        }
    }

    pickTranslationSet() {
        this.browsingModals.browseTranslationSet({ key: "DATA.ACTIONS.SELECT_TRANSLATION_SET" }, true, true).then(
            res => {
                this.translationSet = res;
            }
        );
    }

    isOkClickable(): boolean {
        return this.selectedCategory != null && this.targetEntity != null;
    }

    ok() {
        let returnData: LexicoRelationModalReturnData = {
            category: this.selectedCategory,
            target: this.targetEntity,
            reified: this.reified,
        };
        if (this.reified) {
            returnData.undirectional = this.undirectional;
            returnData.tranlsationSet = this.translation ? this.translationSet : null;
        }
        this.activeModal.close(returnData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export interface LexicoRelationModalReturnData {
    category: ARTURIResource;
    target: ARTResource;
    reified: boolean;
    //following to be provided only if not plain
    undirectional?: boolean;
    tranlsationSet?: ARTResource; //in case of tranlsation
}