import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource } from "src/app/models/ARTResources";
import { EntryReference, LexicalEntry } from "src/app/models/LexicographerView";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { LexViewHelper } from "../LexViewHelper";

@Component({
    selector: "subterm-list",
    templateUrl: "./subtermListComponent.html",
    host: { class: "d-block" }
})
export class SubtermListComponent{
    @Input() readonly: boolean = false;
    @Input() entry: LexicalEntry;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update
    
    subterms: EntryReference[];
    addAuthorized: boolean;

    constructor(private lexViewHelper: LexViewHelper) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['entry']) {
            this.addAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddSubterm) && !this.readonly;
            this.subterms = this.entry.subterms;
        }
    }

    add() {
        this.lexViewHelper.addSubterm(this.entry.id).subscribe(
            (done: boolean) => {
                if (done) {
                    this.update.emit();
                }
            }
        )
    }

    resourceDblClick(res: ARTResource) {
        this.dblclickObj.emit(res);
    }

    onUpdate() {
        this.update.emit();
    }

}