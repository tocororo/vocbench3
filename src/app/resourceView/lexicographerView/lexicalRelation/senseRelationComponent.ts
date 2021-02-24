import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { LexicalResourceUtils, Sense, SenseReference, SenseRelation } from "src/app/models/LexicographerView";
import { Vartrans } from "src/app/models/Vocabulary";
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

    constructor(private resourceService: ResourcesServices) { }

    ngOnChanges(change: SimpleChanges) {
        if (change['relation']) {
            this.init();
        }
    }

    init() {
        if (this.relation.source.some(s => s.id.equals(this.sense.id))) { //current sense is among the source entries
            this.targetRef = this.relation.target;
        } else { //current entry is not among the source entries => inverse relation
            this.targetRef = this.relation.source;
        }
        // category must be hidden only if is only one and it isvartrans:translatableAs in a translation relation
        this.showCategory = !(this.relation.category.length == 1 && this.relation.category[0].equals(Vartrans.translatableAs));

        this.readonly = LexicalResourceUtils.isInStaging(this.relation);
        this.deleteAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.sense.id) && !this.readonly;
    }

    delete() {
        //delete allowed only when not in validation, so just get the first of category and target reference
        if (this.relation.id == null) { //plain relation
            this.resourceService.removeValue(this.sense.id, this.relation.category[0], this.targetRef[0].id).subscribe(
                () => {
                    this.update.emit();
                }
            )
        } else { //reified
            alert("Removal of reified relation still not handled")
        }
    }

    categoryDblClick(category: ARTURIResource) {
        this.dblclickObj.emit(category);
    }

    targetDblClick(ref: SenseReference) {
        this.dblclickObj.emit(ref.id);
    }

}