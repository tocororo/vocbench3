import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTNode, ARTResource } from "src/app/models/ARTResources";
import { CustomForm, CustomFormValue } from "src/app/models/CustomForms";
import { ConceptReference, Sense } from "src/app/models/LexicographerView";
import { OntoLex, SKOS } from "src/app/models/Vocabulary";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { SkosServices } from "src/app/services/skosServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { VBContext } from "src/app/utils/VBContext";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ResViewModalServices } from "../../resourceViewEditor/resViewModals/resViewModalServices";
import { DefEnrichmentType, DefinitionEnrichmentHelper, DefinitionEnrichmentInfo } from "../../termView/definitionEnrichmentHelper";
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

    constructor(private propService: PropertyServices, private skosService: SkosServices,
        private resourceService: ResourcesServices, private customFormsServices: CustomFormsServices,
        private basicModals: BasicModalServices, private resViewModals: ResViewModalServices) {}

    ngOnInit() {
        let langAuthorized = VBContext.getLoggedUser().isAdmin() || VBContext.getProjectUserBinding().getLanguages().indexOf(this.lang) != -1;
        this.addDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddNote, this.concept.id) && langAuthorized && !this.readonly;
        this.editDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosUpdateNote, this.concept.id) && langAuthorized && !this.readonly;
        this.deleteDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveNote, this.concept.id) && langAuthorized && !this.readonly;
    }

    deleteConcept() {
        this.resourceService.removeValue(this.sense.id, OntoLex.isLexicalizedSenseOf, this.concept.id).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

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
                this.skosService.addNote(this.concept.id, SKOS.definition, cfValue).subscribe(
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
        this.skosService.addNote(this.concept.id, SKOS.definition, def).subscribe(
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
            this.skosService.updateNote(this.concept.id, SKOS.definition, oldDef, newDef).subscribe(
                () => this.update.emit()
            )
        } else { // probably reified
            this.lexViewCache.getDefinitionRangeConfig().subscribe(
                conf => {
                    if (conf.hasCustomRange) {
                        this.customFormsServices.updateReifiedResourceShow(this.concept.id, SKOS.definition, <ARTResource>oldDef, newDef).subscribe(
                            () => this.update.emit()
                        )
                    }
                }
            )
        }
    }

    deleteDefinition(def: ARTNode) {
        if (def.isLiteral()) {
            this.skosService.removeNote(this.concept.id, SKOS.definition, def).subscribe(
                () => {
                    this.update.emit();
                }
            )
        } else { // probably reified
            this.lexViewCache.getDefinitionRangeConfig().subscribe(
                conf => {
                    if (conf.hasCustomRange) {
                        this.customFormsServices.removeReifiedResource(this.concept.id, SKOS.definition, <ARTResource>def).subscribe(
                            () => this.update.emit()
                        )
                    }
                }
            )
        }
        
    }


    resourceDblClick() {
        this.dblclickObj.emit(this.concept.id);
    }

}