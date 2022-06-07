import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { LexicalResourceUtils, Sense, SenseReference, SenseRelation } from "src/app/models/LexicographerView";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";

@Component({
    selector: "sense-relation",
    templateUrl: "./senseRelationComponent.html",
    host: { class: "d-block" }
})
export class SenseRelationComponent {
    @Input() readonly: boolean = false;
    @Input() translation: boolean = false; //tells if this relation is about translation
    @Input() sense: Sense;
    @Input() relation: SenseRelation;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update

    showCategory: boolean;
    targetRef: SenseReference[];

    deleteAuthorized: boolean;

    constructor(private resourceService: ResourcesServices, private ontolexService: OntoLexLemonServices) { }

    ngOnChanges(change: SimpleChanges) {
        if (change['relation']) {
            this.init();
        }
    }

    init() {
        /*
        reified relations can be created with "unidirectional" flag to true or false (see LexicalRelationModal)
        - true: the SenseRelation in input has the two related senses in the "related" list
        - false: the SenseRelation in input has the two related senses in the source/target lists
        */
        //unidirectional
        if (this.relation.related.length > 0) {
            this.targetRef = this.relation.related.filter(r => !r.id.equals(this.sense.id));
        } else { //not-unidirectional
            if (this.relation.source.some(s => s.id.equals(this.sense.id))) { //current sense is among the source entries
                this.targetRef = this.relation.target;
            } else { //current entry is not among the source entries => inverse relation
                this.targetRef = this.relation.source;
            }
        }
        
        // category must be shown only if there are multiple categories (validation) or the relation doesn't rapresents a translation
        this.showCategory = this.relation.category.length != 1 || !this.translation;

        this.readonly = LexicalResourceUtils.isInStaging(this.relation);
        if (this.relation.id) { //plain
            this.deleteAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.sense.id) && !this.readonly;
        } else { //reified
            this.deleteAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexDeleteSenseRelation) && !this.readonly;
        }
    }

    delete() {
        let deleteFn: Observable<void>;
        if (this.relation.id == null) { //plain relation
            //delete allowed only when not in validation, so just get the first of category and target reference
            deleteFn = this.resourceService.removeValue(this.sense.id, this.relation.category[0], this.targetRef[0].id);
        } else { //reified
            deleteFn = this.ontolexService.deleteSenseRelation(this.relation.id);
        }
        deleteFn.subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    categoryDblClick(category: ARTURIResource) {
        this.dblclickObj.emit(category);
    }

    targetDblClick(ref: SenseReference) {
        this.dblclickObj.emit(ref.id);
    }

}