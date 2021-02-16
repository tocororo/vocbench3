import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTNode, ARTResource } from "src/app/models/ARTResources";
import { CustomForm, CustomFormValue } from "src/app/models/CustomForms";
import { Sense } from "src/app/models/LexicographerView";
import { OntoLex, SKOS } from "src/app/models/Vocabulary";
import { DefEnrichmentType, DefinitionEnrichmentHelper, DefinitionEnrichmentInfo } from "src/app/resourceView/termView/definitionEnrichmentHelper";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { SkosServices } from "src/app/services/skosServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { VBContext } from "src/app/utils/VBContext";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { ResViewModalServices } from "../../resourceViewEditor/resViewModals/resViewModalServices";
import { LexViewCache } from "../LexViewChache";

@Component({
    selector: "lexical-sense",
    templateUrl: "./lexicalSenseComponent.html",
    styleUrls: ["./lexicalSenseComponent.css"],
    host: { class: "d-block" }
})
export class LexicalSenseComponent {
    @Input() readonly: boolean = false;
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

    constructor(private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices, private skosService: SkosServices,
        private propService: PropertyServices, private customFormsServices: CustomFormsServices,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices, private resViewModals: ResViewModalServices) {}

    ngOnInit() {
        let langAuthorized = VBContext.getLoggedUser().isAdmin() || VBContext.getProjectUserBinding().getLanguages().indexOf(this.lang) != -1;
        //the following are authorized only for reified senses (this.sense.id not null)and not for plain
        this.addDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddNote, this.sense.id) && langAuthorized && !this.readonly;
        this.editDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosUpdateNote, this.sense.id) && langAuthorized && !this.readonly;
        this.deleteDefAuthorized = this.sense.id && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveNote, this.sense.id) && langAuthorized && !this.readonly;
    }

    deleteSense() {
        this.ontolexService.removeSense(this.sense.id, true).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    //CONCEPT
    
    setConcept() {
        this.browsingModals.browseConceptTree({key: "DATA.ACTIONS.SELECT_LEXICAL_CONCEPT"}, null, true).then(
            lexConc => {
                this.resourceService.addValue(this.sense.id, OntoLex.isLexicalizedSenseOf, lexConc).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => {}
        )
    }

    //DEFINITION

    addDefinition() {
        this.lexViewCache.getDefinitionRangeConfig().subscribe(
            defRangeConf => {
                if (defRangeConf.hasCustomRange) { //exists custom range(s) for skos:definition
                    DefinitionEnrichmentHelper.getDefinitionEnrichmentInfo(this.propService, this.basicModals, defRangeConf).subscribe(
                        (info: DefinitionEnrichmentInfo) => {
                            if (info.type == DefEnrichmentType.literal) {
                                this.addInlinePlainDefinition();
                            } else if (info.type == DefEnrichmentType.customForm) {
                                this.addCustomFormDefinition(info.form);
                            }
                        }
                    );
                } else { //plain definition => inline definition
                    this.addInlinePlainDefinition();
                }
            }
        );
    }

    /**
     * Create a definition through a CF
     * @param cf 
     */
    private addCustomFormDefinition(cf: CustomForm) {
        this.resViewModals.enrichCustomForm({key:"DATA.ACTIONS.ADD_DEFINITION"}, cf.getId(), this.lang).then(
            (entryMap: { [key: string]: any }) => {
                let cfValue: CustomFormValue = new CustomFormValue(cf.getId(), entryMap);
                this.skosService.addNote(this.sense.id, SKOS.definition, cfValue).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    private addInlinePlainDefinition() {
        this.pendingDef = true;
    }
    
    onPendingDefConfirmed(value: string) {
        let def: ARTLiteral = new ARTLiteral(value, null, this.lang);
        this.skosService.addNote(this.sense.id, SKOS.definition, def).subscribe(
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
        if (oldDef.isLiteral()) { // if standard
            this.skosService.updateNote(this.sense.id, SKOS.definition, oldDef, newDef).subscribe(
                () => this.update.emit()
            )
        } else { // probably reified
            this.lexViewCache.getDefinitionRangeConfig().subscribe(
                conf => {
                    if (conf.hasCustomRange) {
                        this.customFormsServices.updateReifiedResourceShow(this.sense.id, SKOS.definition, <ARTResource>oldDef, newDef).subscribe(
                            () => this.update.emit()
                        )
                    }
                }
            )
        }
    }

    deleteDefinition(def: ARTNode) {
        if (def.isLiteral()) {
            this.skosService.removeNote(this.sense.id, SKOS.definition, def).subscribe(
                () => {
                    this.update.emit();
                }
            )
        } else { // probably reified
            this.lexViewCache.getDefinitionRangeConfig().subscribe(
                conf => {
                    if (conf.hasCustomRange) {
                        this.customFormsServices.removeReifiedResource(this.sense.id, SKOS.definition, <ARTResource>def).subscribe(
                            () => this.update.emit()
                        )
                    }
                }
            )
        }
        
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