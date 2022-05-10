import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { EntryReference, LexicalEntry, LexicalResourceUtils } from "src/app/models/LexicographerView";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";

@Component({
    selector: "subterm",
    templateUrl: "./subtermComponent.html",
    host: { class: "d-block" }
})
export class SubtermComponent {
    @Input() readonly: boolean = false;
    @Input() entry: LexicalEntry;
    @Input() subterm: EntryReference;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update

    deleteAuthorized: boolean;

    constructor(private ontolexService: OntoLexLemonServices) { }

    ngOnInit() {
        this.deleteAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveSubterm) && !this.readonly && !LexicalResourceUtils.isTripleInStaging(this.subterm);
    }

    delete() {
        this.ontolexService.removeSubterm(<ARTURIResource>this.entry.id, <ARTURIResource>this.subterm.id).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    onDblClick() {
        this.dblclickObj.emit(this.subterm.id);
    }

}