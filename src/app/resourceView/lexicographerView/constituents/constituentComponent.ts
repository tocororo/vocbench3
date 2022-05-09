import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Constituent } from "src/app/models/LexicographerView";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { LexViewCache } from "../LexViewChache";

@Component({
    selector: "constituent",
    templateUrl: "./constituentComponent.html",
    host: { class: "d-block" }
})
export class ConstituentComponent {
    @Input() readonly: boolean = false;
    @Input() constituent: Constituent;
    @Input() lexViewCache: LexViewCache;
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update

    pendingFacet: boolean;

    addFacetAuthorized: boolean;

    constructor() { }

    ngOnInit() {
        this.addFacetAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, this.constituent.id) && !this.readonly;
    }

    addFacet() {
        this.pendingFacet = true;
    }
    onPendingFacetCanceled() {
        this.pendingFacet = false;
    }

    onUpdate() {
        this.update.emit();
    }

}