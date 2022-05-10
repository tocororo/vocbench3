import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource } from "src/app/models/ARTResources";
import { Constituent, LexicalEntry } from "src/app/models/LexicographerView";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { LexViewCache } from "../LexViewChache";
import { LexViewHelper } from "../LexViewHelper";

@Component({
    selector: "constituent-list",
    templateUrl: "./constituentListComponent.html",
    host: { class: "d-block" }
})
export class ConstituentListComponent {
    @Input() readonly: boolean = false;
    @Input() entry: LexicalEntry;
    @Input() lexViewCache: LexViewCache;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update
    
    constituents: Constituent[];

    editAuthorized: boolean;

    constructor(private lexViewHelper: LexViewHelper) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['entry']) {
            this.constituents = this.entry.constituents;

            this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexSetLexicalEntryConstituent) && !this.readonly;
        }
    }

    edit() {
        this.lexViewHelper.setConstituents(this.entry.id).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    resourceDblClick(res: ARTResource) {
        this.dblclickObj.emit(res);
    }

    onUpdate() {
        this.update.emit();
    }

}