import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { LexicalEntry, LexicalRelation } from "src/app/models/LexicographerView";
import { Vartrans } from "src/app/models/Vocabulary";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "translatable-as",
    templateUrl: "./translatableAsComponent.html",
    host: { class: "d-block" }
})
export class TranslatableAsComponent{
    @Input() readonly: boolean = false;
    @Input() entry: LexicalEntry;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update

    relations: LexicalRelation[];
    addAuthorized: boolean;

    constructor(private resourceService: ResourcesServices, private browsingModals: BrowsingModalServices) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['entry']) {
            this.addAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, this.entry.id) && !this.readonly;
            this.relations = this.entry.translatableAs;
        }
    }

    add() {
        this.browsingModals.browseLexicalEntryList({key:"DATA.ACTIONS.SELECT_LEXICAL_ENTRY"}).then(
            (entry: ARTURIResource) => {
                this.resourceService.addValue(this.entry.id, Vartrans.translatableAs, entry).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => {}
        )
    }

    resourceDblClick(res: ARTResource) {
        this.dblclickObj.emit(res);
    }

    onUpdate() {
        this.update.emit();
    }

}