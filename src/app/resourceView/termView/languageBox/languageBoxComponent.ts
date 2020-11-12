import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource } from '../../../models/ARTResources';
import { CustomForm, CustomFormValue } from '../../../models/CustomForms';
import { Language, Languages } from '../../../models/LanguagesCountries';
import { OntoLex, SKOS, SKOSXL } from '../../../models/Vocabulary';
import { CustomFormsServices } from '../../../services/customFormsServices';
import { PropertyServices } from '../../../services/propertyServices';
import { ResourcesServices } from '../../../services/resourcesServices';
import { SkosServices } from '../../../services/skosServices';
import { SkosxlServices } from '../../../services/skosxlServices';
import { AuthorizationEvaluator } from '../../../utils/AuthorizationEvaluator';
import { VBActionsEnum } from '../../../utils/VBActions';
import { VBContext } from '../../../utils/VBContext';
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { CreationModalServices } from '../../../widget/modal/creationModal/creationModalServices';
import { ResViewModalServices } from '../../resourceViewEditor/resViewModals/resViewModalServices';
import { DefEnrichmentType, DefinitionEnrichmentHelper, DefinitionEnrichmentInfo } from '../definitionEnrichmentHelper';


@Component({
    selector: "lang-box",
    templateUrl: "./languageBoxComponent.html",
    styleUrls: ["./languageBoxComponent.css"]
})

export class LanguageBoxComponent {

    @Input() lang: string;
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource: ARTResource;
    @Input() defCrConfig: DefinitionCustomRangeConfig;
    @Input() readonly: boolean;
    @Output() update = new EventEmitter();
    @Output() delete = new EventEmitter(); //requires the parent to delete this component
    
    langForFlag: Language;
    definitions: ARTNode[]; // it is useful for method onDefinitionEdited
    terms: TermStructView[]; // it is used to assign each term if it's a prefLabel or not
    private lexicalizationModelType: string;

    emptyTerm: boolean; //tells if there is an empty term (eventually waiting to be filled or just emptied)
    emptyDef: boolean; //tells if there is an empty definition  (eventually waiting to be filled or just emptied)

    //actions auth
    addDefAuthorized: boolean;
    editDefAuthorized: boolean;
    deleteDefAuthorized: boolean;
    addLabelAuthorized: boolean;

    constructor(public el: ElementRef, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private resourcesService: ResourcesServices, private customFormsServices: CustomFormsServices,
        private propService: PropertyServices, private resViewModals: ResViewModalServices, 
        private basicModals: BasicModalServices, private creationModals: CreationModalServices) { }

    ngOnInit() {
        this.lexicalizationModelType = VBContext.getWorkingProject().getLexicalizationModelType();//it's useful to understand project lexicalization
        this.langForFlag = Languages.getLanguageFromTag(this.lang)
    }

    ngOnChanges(changes: SimpleChanges) {
        this.initializeDefinitions();
        this.initializeTerms();

        if (changes['resource']) {
            let langAuthorized = VBContext.getLoggedUser().isAdmin() || VBContext.getProjectUserBinding().getLanguages().indexOf(this.lang) != -1;
            /* 
            all the actions are authorized if:
            - user has authorization on the action itself
            - user has the language assigned
            - term view is not in readonly
            */
            this.addLabelAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddLexicalization, this.resource) && langAuthorized && !this.readonly;
            this.addDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddNote, this.resource) && langAuthorized && !this.readonly;
            this.editDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, this.resource) && langAuthorized && !this.readonly;
            this.deleteDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.resource) && langAuthorized && !this.readonly;
        }
    }

    private initializeDefinitions() {
        this.definitions = [];
        if (this.predicateObjectList != null) {
            this.predicateObjectList.forEach(po => {
                if (po.getPredicate().equals(SKOS.definition)) {
                    if (po.getObjects().length != 0) {
                        po.getObjects().forEach(d => {
                            this.definitions.push(d)
                        })
                    }
                }
            });
        }
        if (this.definitions.length == 0) { // it creates empty box definition when user adds a new language
            this.definitions.push(null)
        }
        this.updateEmptyDef();
    }

    private initializeTerms() {
        this.terms = [];
        if (this.predicateObjectList != null) {
            this.predicateObjectList.forEach(po => {
                if (po.getPredicate().equals(SKOSXL.prefLabel) || po.getPredicate().equals(SKOS.prefLabel)) {
                    if (po.getObjects().length != 0) {
                        po.getObjects().forEach(obj => {
                            this.terms.push({ object: obj, predicate: po.getPredicate(), isPrefLabel: true, lang: this.lang })
                        })
                    } else { //  always insert a prefLabel first both if there are no objects with a prefLabel predicate and if there are only objects with an altLabel type predicate
                        this.terms.push({ predicate: po.getPredicate(), isPrefLabel: true, lang: this.lang })
                    }
                } else if (po.getPredicate().equals(SKOSXL.altLabel) || po.getPredicate().equals(SKOS.altLabel)) {
                    if (po.getObjects().length != 0) {
                        po.getObjects().forEach(obj => {
                            this.terms.push({ object: obj, predicate: po.getPredicate(), isPrefLabel: false, lang: this.lang })
                        })
                    }
                }
            })
        }

        this.updateEmptyTerm();
    }

    /**
     * Delete a definition:
     * 1) if there are more than one definition it deletes entire definition box 
     * 2) if there is only one definition it deletes value but an empty box remains
     * @param defToDelete 
     */
    private deleteDefinition(defToDelete: ARTNode) {
        if (defToDelete == null) {
            if (this.definitions.length > 1) { //delete the definition only if it was not the only one (namely there should not happen that there is no any "definition" row)
                this.definitions.pop();
                this.updateEmptyDef();
            }
        } else {
            let serviceInvocation: Observable<any>;
            if (defToDelete.isLiteral()) { // if standard
                serviceInvocation = this.resourcesService.removeValue(<ARTURIResource>this.resource, SKOS.definition, defToDelete);
            } else if (defToDelete.isResource() && this.defCrConfig.hasCustomRange) { // if reified
                serviceInvocation = this.customFormsServices.removeReifiedResource(this.resource, SKOS.definition, defToDelete);
            } //other cases not handled but should not happen
            if (serviceInvocation != null) {
                serviceInvocation.subscribe(
                    () => {
                        //if the deleted definition was the only one and there are no terms, just empty the definition object
                        //and prevent to refresh the entire res view (otherwise the whole box disappears)
                        if (this.definitions.length == 1 && (this.terms.length == 0 || this.emptyTerm)) {
                            this.definitions[0] = null;
                            this.updateEmptyDef();
                        } else { //there were multiple definitions
                            this.update.emit();
                        }
                    }
                )
            }
        }
    }


    /**
     *  Add a new empty box definition
     */
    addDefinitionItem() {
        if (this.defCrConfig.hasCustomRange) { //exists custom range(s) for skos:definition
            DefinitionEnrichmentHelper.getDefinitionEnrichmentInfo(this.propService, this.basicModals, this.defCrConfig).subscribe(
                (info: DefinitionEnrichmentInfo) => {
                    if (info.type == DefEnrichmentType.literal) {
                        this.addPlainDefinition();
                    } else if (info.type == DefEnrichmentType.customForm) {
                        this.addCustomFormDefinition(info.form);
                    }
                }
            );
        } else {
            this.addInlineDefinition();
        }
    }

    /**
     * Add a new empty box definition
     */
    private addInlineDefinition() {
        this.definitions.push(null)
        this.updateEmptyDef();
    }

    /**
     * Open a modal for entering a new plain definition
     */
    private addPlainDefinition() {
        this.creationModals.newPlainLiteral("Add a definition", null, false, this.lang, true).then(
            (literalDef: ARTLiteral) => {
                this.skosService.addNote(this.resource, SKOS.definition, literalDef).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            }
        )
    }

    /**
     * Create a definition through a CF
     * @param cf 
     */
    private addCustomFormDefinition(cf: CustomForm) {
        this.resViewModals.enrichCustomForm("Add " + SKOS.definition.getShow(), cf.getId(), this.lang).then(
            (entryMap: { [key: string]: any }) => {
                let cfValue: CustomFormValue = new CustomFormValue(cf.getId(), entryMap);
                this.skosService.addNote(this.resource, SKOS.definition, cfValue).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    // it needs to add ontolex part
    addTermBox() {
        if (this.terms.some(term => term.predicate.equals(SKOSXL.prefLabel) || term.predicate.equals(SKOS.prefLabel))) { // it means that already there is a prefLabel predicate => so add an altLabel (with SKOS and SKOSXL)
            if (this.lexicalizationModelType == SKOSXL.uri) {
                this.terms.push({ predicate: SKOSXL.altLabel, lang: this.lang })
                this.updateEmptyTerm();
            } else if (this.lexicalizationModelType == SKOS.uri) {
                this.terms.push({ predicate: SKOS.altLabel, lang: this.lang })
                this.updateEmptyTerm();
            }
        } else { // contrary
            if (this.lexicalizationModelType == SKOSXL.uri) {
                this.terms.push({ predicate: SKOSXL.prefLabel, isPrefLabel: true, lang: this.lang })
                this.sortPredicates(this.terms)
                this.updateEmptyTerm();
            } else if (this.lexicalizationModelType == SKOS.uri) {
                this.terms.push({ predicate: SKOS.prefLabel, isPrefLabel: true, lang: this.lang })
                this.sortPredicates(this.terms)
                this.updateEmptyTerm();
            }
        }

    }


    // it needs to add ontolex part
    /**
    * Take in input a list of TermStructView and sort their predicates:
    *  - skos and skosxl cases: first prefLabel and then altLabel
    * @param list 
    */
    private sortPredicates(list: TermStructView[]) {
        if (this.lexicalizationModelType == SKOS.uri) {
            list.sort((second: TermStructView, first: TermStructView) => {
                if (first.predicate.equals(SKOS.prefLabel) && second.predicate.equals(SKOS.altLabel)) {
                    return 1;
                }
                if (second.predicate.equals(SKOS.prefLabel) && first.predicate.equals(SKOS.altLabel)) {
                    return -1;
                }
                return 0;
            })
        } else if (this.lexicalizationModelType == SKOSXL.uri) {
            list.sort((second: TermStructView, first: TermStructView) => {
                if (first.predicate.equals(SKOSXL.prefLabel) && second.predicate.equals(SKOSXL.altLabel)) {
                    return 1;
                }
                if (second.predicate.equals(SKOSXL.prefLabel) && first.predicate.equals(SKOSXL.altLabel)) {
                    return -1;
                }
                return 0;
            })

        } else if (this.lexicalizationModelType == OntoLex.uri) {
            // ontolex
        }

    }


    /**
     * This method allows to delete a term box both when it's empty and when it has a value
     * @param termToDelete 
     */

    private deleteTerm(termToDelete: TermStructView) {
        if (termToDelete.object == null) { // case in which a box is deleted and it never be modified 
            this.terms.pop();
            this.updateEmptyTerm();
        } else { // case in which a box is deleted and conteins a term with value
            this.terms.forEach(term => {
                if (term == termToDelete) {
                    if (this.definitions.length == 1 && this.definitions.some(def => def == null) && this.terms.length == 1) {  
                        //it means that if there is only one term box( with a value inside) and one empty definition then delete only term box instead of all (with refresh)
                        let serviceInvocation: Observable<any>;
                        if (term.predicate.equals(SKOSXL.prefLabel)) {
                            serviceInvocation = this.skosxlService.removePrefLabel(<ARTURIResource>this.resource, <ARTResource>termToDelete.object);
                        } else if (term.predicate.equals(SKOSXL.altLabel)) {
                            serviceInvocation = this.skosxlService.removeAltLabel(<ARTURIResource>this.resource, <ARTResource>termToDelete.object);
                        } else if (term.predicate.equals(SKOS.prefLabel)) {
                            serviceInvocation = this.skosService.removePrefLabel(<ARTURIResource>this.resource, <ARTLiteral>termToDelete.object);
                        } else if (termToDelete.predicate.equals(SKOS.altLabel)) {
                            serviceInvocation = this.skosService.removeAltLabel(<ARTURIResource>this.resource, <ARTLiteral>termToDelete.object);
                        }
                        if (serviceInvocation != null) {
                            serviceInvocation.subscribe(
                                () => {
                                    this.terms.splice(this.terms.indexOf(termToDelete), 1)
                                    this.updateEmptyTerm();
                                    // if (this.terms.length == 0) {
                                    //     this.displayRemoveButtonOnFlag = true
                                    // }
                                }
                            )
                        }
                    } else {
                        let serviceInvocation: Observable<any>;
                        if (term.predicate.equals(SKOSXL.prefLabel)) {
                            serviceInvocation = this.skosxlService.removePrefLabel(<ARTURIResource>this.resource, <ARTResource>termToDelete.object);
                        } else if (term.predicate.equals(SKOSXL.altLabel)) {
                            serviceInvocation = this.skosxlService.removeAltLabel(<ARTURIResource>this.resource, <ARTResource>termToDelete.object);
                        } else if (term.predicate.equals(SKOS.prefLabel)) {
                            serviceInvocation = this.skosService.removePrefLabel(<ARTURIResource>this.resource, <ARTLiteral>termToDelete.object);
                        } else if (termToDelete.predicate.equals(SKOS.altLabel)) {
                            serviceInvocation = this.skosService.removeAltLabel(<ARTURIResource>this.resource, <ARTLiteral>termToDelete.object);
                        }
                        if (serviceInvocation != null) {
                            serviceInvocation.subscribe(
                                () => this.update.emit()
                            );
                        }
                    }
                }

            })

        }

    }

    /**
     * This method removes entire box when there is only a definition box and there are not terms
     */

    removeBox() {
        this.delete.emit();
    }

    /**
     * When a definition or a term is edited or added requires update of res simple view 
     */
    private onDefUpdate() {
        this.update.emit();
    }
    private onTermUpdate() {
        this.update.emit();
    }

    /**
     * Update the flag that keep trace if there is an empty term in the terms list.
     * To be invoked each time there is a change to the terms list (but the RV is not updated)
     */
    private updateEmptyTerm() {
        this.emptyTerm = this.terms.some(t => t.object == null);
    }

    /**
     * Update the flag that keep trace if there is an empty definition in the definitions list
     * To be invoked each time there is a change to the definitions list (but the RV is not updated)
     */
    private updateEmptyDef() {
        this.emptyDef = this.definitions.some(d => d == null);
    }


}

export interface TermStructView {
    object?: ARTNode;
    predicate?: ARTURIResource;
    isPrefLabel?: boolean;
    lang?: string
}

export interface DefinitionCustomRangeConfig {
    hasLiteralRange: boolean; //tells if the "standard" range is available (not replaced by the CR)
    hasCustomRange: boolean; //tells if CustomRange is available
    customForms?: CustomForm[]; //list of the available CFs
}