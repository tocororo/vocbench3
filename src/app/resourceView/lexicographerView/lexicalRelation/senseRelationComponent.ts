import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { LexicalResourceUtils, Sense, SenseReference, SenseRelation } from "src/app/models/LexicographerView";
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
    @Input() sense: Sense;
    @Input() relation: SenseRelation;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update

    showCategory: boolean;
    category: ARTURIResource;
    targetRef: SenseReference[];

    deleteAuthorized: boolean;

    constructor(private resourceService: ResourcesServices) {}

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
        this.category = this.relation.category[0];
        this.showCategory = this.category != null;

        this.readonly = LexicalResourceUtils.isInStaging(this.relation);
        this.deleteAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.sense.id) && !this.readonly;
    }

    delete() {
        //delete allowed only when not in validation, so just get the first of category and target EntryRerference
        if (this.relation.id == null) { //plain relation
            this.resourceService.removeValue(this.sense.id, this.category, this.targetRef[0].id).subscribe(
                () => {
                    this.update.emit();
                }
            )
        } else { //reified
            //TODO how?
            alert("Removal of reified relation still not handled")
        }
    }

    categoryDblClick() {
        this.dblclickObj.emit(this.category);
    }

    targetDblClick(ref: SenseReference) {
        this.dblclickObj.emit(ref.id);
    }

}