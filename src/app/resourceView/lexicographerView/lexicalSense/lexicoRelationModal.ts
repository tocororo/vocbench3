import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { VBContext } from "src/app/utils/VBContext";

@Component({
    selector: "lexico-relation-modal",
    templateUrl: "./lexicoRelationModal.html",
})
export class LexicoRelationModal {
    @Input() title: string;
    @Input() sourceEntity: ARTResource;

    categories: ARTURIResource[];
    selectedCategory: ARTURIResource;
    targetEntity: ARTURIResource;
    unidirectional: boolean = true;
    
    constructor(private activeModal: NgbActiveModal, private ontolexService: OntoLexLemonServices) {}
    
    ngOnInit() {
        this.initPropList();
    }
    
    initPropList() {
        let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
        this.ontolexService.getSenseRelationCategories(lexicon).subscribe(
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
            unidirectional: this.unidirectional
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
    unidirectional: boolean;
}