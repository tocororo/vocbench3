import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Form, LexicographerView } from "src/app/models/LexicographerView";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { ARTLiteral, ARTResource } from "../../models/ARTResources";
import { ResourceViewCtx } from "../../models/ResourceView";
import { ProjectContext } from "../../utils/VBContext";
import { LexViewCache } from "./LexViewChache";

@Component({
    selector: "lex-entry",
    templateUrl: "./lexEntryComponent.html",
    host: { class: "d-block" }
})
export class LexEntryComponent {
    @Input() lv: LexicographerView;
    @Input() lexViewCache: LexViewCache;
    @Input() readonly: boolean = false;
    @Input() context: ResourceViewCtx;
    @Input() projectCtx: ProjectContext;
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    title: ARTLiteral; //written rep of the canonical form (if in validation, the stage-add is chosen)

    pendingMorphoProp: boolean;

    //auth
    addMorphoPropAuthorized: boolean;

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['lv'] && changes['lv'].currentValue) {
            this.initTitle();
        }

        this.addMorphoPropAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, this.lv.id) && !this.readonly;
    }

    /**
     * Get the main written rep of the lemma
     */
    private initTitle() {
        //get the canonical form
        let l: Form;
        if (this.lv.lemma.length == 1) {
            l = this.lv.lemma[0]
        } else if (this.lv.lemma.length > 1) { //probably in validation
            l = this.lv.lemma.find(lem => lem.isInStagingAdd());
            if (l == null) { //no lemma in addition => get the first one
                l = this.lv.lemma[0]
            }
        }
        if (l != null) {
            //get the written rep
            if (l.writtenRep.length == 1) {
                this.title = l.writtenRep[0];
            } else if (l.writtenRep.length > 1) { //probably in validation
                this.title = l.writtenRep.find(wr => ResourceUtils.isTripleInStagingAdd(wr));
                if (this.title == null) { //no writtenRep in addition => get the first one
                    this.title = l.writtenRep[0];
                }
            }
        }
    }

    /**
     * === MORPHOSYNTACTIC PROP ===
     */

    addMorphosintacticProp() {
        this.pendingMorphoProp = true;
    }

    onPendingMorphPropCanceled() {
        this.pendingMorphoProp = false;
    }

    /**
     * Propagate the update request from the child component (morphosyntactic-prop and phonetic-rep)
     */
    onUpdate() {
        this.update.emit();
    }

}