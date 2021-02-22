import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTNode, ARTResource } from "src/app/models/ARTResources";
import { ConceptReference, LexicalResourceUtils, Sense } from "src/app/models/LexicographerView";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { VBContext } from "src/app/utils/VBContext";
import { LexViewCache } from "../LexViewChache";

@Component({
    selector: "concept-ref",
    templateUrl: "./conceptReferenceComponent.html",
    host: { class: "d-block" }
})
export class ConceptReferenceComponent {
    @Input() readonly: boolean = false;
    @Input() concept: ConceptReference;
    @Input() sense: Sense;
    @Input() lang: string;
    @Input() lexViewCache: LexViewCache;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    pendingDef: boolean;

    //actions auth
    addDefAuthorized: boolean;
    editDefAuthorized: boolean;
    deleteDefAuthorized: boolean;

    deleteConceptAuthorized: boolean;

    constructor(private ontolexService: OntoLexLemonServices) {}

    ngOnInit() {
        let langAuthorized = VBContext.getLoggedUser().isAdmin() || VBContext.getProjectUserBinding().getLanguages().indexOf(this.lang) != -1;

        if (LexicalResourceUtils.isInStagingRemove(this.concept)) {
            this.readonly = true;
        }

        this.addDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddDefinition, this.concept.id) && langAuthorized && !this.readonly;
        this.editDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexUpdateDefinition, this.concept.id) 
            && langAuthorized && !this.readonly && !LexicalResourceUtils.isInStaging(this.concept);
        this.deleteDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveDefinition, this.concept.id) 
            && langAuthorized && !this.readonly && !LexicalResourceUtils.isInStaging(this.concept);

        this.deleteConceptAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveConcept) && !this.readonly && !LexicalResourceUtils.isInStaging(this.concept);
    }

    deleteConcept() {
        this.ontolexService.removeConcept(this.sense.id, this.concept.id, true).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    addDefinition() {
        this.pendingDef = true;
    }
    onPendingDefConfirmed(value: string) {
        let def: ARTLiteral = new ARTLiteral(value, null, this.lang);
        let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
        this.ontolexService.addDefinition(this.concept.id, def, lexicon).subscribe(
            () => {
                this.update.emit();        
            }
        )
    }
    onPendingDefCanceled() {
        this.pendingDef = false;
    }

    onUpdate() {
        this.update.emit();
    }

    resourceDblClick() {
        this.dblclickObj.emit(this.concept.id);
    }

}