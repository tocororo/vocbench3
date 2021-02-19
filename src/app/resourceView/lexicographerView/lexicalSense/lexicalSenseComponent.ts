import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTNode, ARTResource } from "src/app/models/ARTResources";
import { LexicalEntry, Sense } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { VBContext } from "src/app/utils/VBContext";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { NewOntoLexicalizationCfModalReturnData } from "src/app/widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal";
import { LexViewCache } from "../LexViewChache";

@Component({
    selector: "lexical-sense",
    templateUrl: "./lexicalSenseComponent.html",
    styleUrls: ["./lexicalSenseComponent.css"],
    host: { class: "d-block" }
})
export class LexicalSenseComponent {
    @Input() readonly: boolean = false;
    @Input() entry: LexicalEntry;
    @Input() sense: Sense;
    @Input() lexViewCache: LexViewCache;
    @Input() lang: string;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    pendingDef: boolean;

    //actions auth
    addDefAuthorized: boolean;
    editDefAuthorized: boolean;
    deleteDefAuthorized: boolean;
    addConceptAuthorized: boolean;
    setReferenceAuthorized: boolean;
    reifySenseAuthorized: boolean;

    constructor(private ontolexService: OntoLexLemonServices, private browsingModals: BrowsingModalServices, private creationModals: CreationModalServices) {}

    ngOnInit() {
        let langAuthorized = VBContext.getLoggedUser().isAdmin() || VBContext.getProjectUserBinding().getLanguages().indexOf(this.lang) != -1;
        //the following are authorized only for reified senses (this.sense.id not null) and not for plain
        this.addDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddDefinition, this.sense.id) && langAuthorized && !this.readonly;
        this.editDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexUpdateDefinition, this.sense.id) && langAuthorized && !this.readonly;
        this.deleteDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveDefinition, this.sense.id) && langAuthorized && !this.readonly;

        this.addConceptAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddConcept) && !this.readonly;
        this.setReferenceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexSetReference) && !this.readonly;
        //reification requires auth for addConceptualization/Lexicalization if the sense is plain with concept or with reference
        this.reifySenseAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddConceptualization, this.entry.id) && 
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalization, this.entry.id) && !this.readonly;
    }

    deleteSense() {
        if (this.sense.id != null) { //reified
            this.ontolexService.removeSense(this.sense.id, true).subscribe(
                () => {
                    this.update.emit();
                }
            );
        } else { //plain
            if (this.sense.concept != null) {
                this.ontolexService.removePlainConceptualization(this.entry.id, this.sense.concept[0].id).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            } else if (this.sense.reference != null) {
                this.ontolexService.removePlainLexicalization(this.entry.id, this.sense.reference[0]).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            }
        }
    }

    reifyPlainSense() {
        if (this.sense.concept != null) {
            this.browsingModals.browseConceptTree({key: "DATA.ACTIONS.SELECT_LEXICAL_CONCEPT"}, null, true).then(
                lexConc => {
                    this.ontolexService.addConceptualization(this.entry.id, lexConc, false, true).subscribe(
                        () => {
                            this.update.emit();
                        }
                    )
                },
                () => {}
            );
        } else if (this.sense.reference != null) {
            this.ontolexService.addLexicalization(this.entry.id, this.sense.reference[0], false, true).subscribe(
                () => {
                    this.update.emit();
                }
            )
        }
    }

    //CONCEPT
    
    setConcept() {
        this.browsingModals.browseConceptTree({key: "DATA.ACTIONS.SELECT_LEXICAL_CONCEPT"}, null, true).then(
            lexConc => {
                this.ontolexService.addConcept(this.sense.id, lexConc, true).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => {}
        )
    }

    //REFERENCE

    setReference() {
        this.creationModals.newOntoLexicalizationCf({key:"DATA.ACTIONS.SET_REFERENCE"}, OntoLex.sense, false).then(
            (data: NewOntoLexicalizationCfModalReturnData) => {
                this.ontolexService.setReference(this.sense.id, data.linkedResource, true, data.createPlain).subscribe(
                    () => {
                        this.update.emit()
                    }
                );
            },
            () => {}
        );
    }

    //DEFINITION

    addDefinition() {
        this.pendingDef = true;
    }
    
    onPendingDefConfirmed(value: string) {
        let def: ARTLiteral = new ARTLiteral(value, null, this.lang);
        let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
        this.ontolexService.addDefinition(this.sense.id, def, lexicon).subscribe(
            () => {
                this.update.emit();        
            }
        )
    }
    onPendingDefCanceled() {
        this.pendingDef = false;
    }

    onDefinitionEdited(oldDef: ARTNode, newValue: string) {
        let newDef: ARTLiteral = new ARTLiteral(newValue, null, this.lang);
        let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
        this.ontolexService.updateDefinition(this.sense.id, oldDef, newDef, lexicon).subscribe(
            () => this.update.emit()
        )
    }

    deleteDefinition(def: ARTNode) {
        let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
        this.ontolexService.removeDefinition(this.sense.id, def, lexicon).subscribe(
            () => this.update.emit()
        )
    }

    /**
     * Propagate the update request from the child component (morphosyntactic-prop and phonetic-rep)
     */
    onUpdate() {
        this.update.emit();
    }

    resourceDblClick(resource: ARTResource) {
        this.dblclickObj.emit(resource);
    }

}