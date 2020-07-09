import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomForm, CustomFormValue } from '../../../models/CustomForms';
import { PropertyServices, RangeResponse } from '../../../services/propertyServices';
import { AuthorizationEvaluator } from '../../../utils/AuthorizationEvaluator';
import { VBActionsEnum } from '../../../utils/VBActions';
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { CreationModalServices } from '../../../widget/modal/creationModal/creationModalServices';
import { ResViewModalServices } from '../../resourceViewEditor/resViewModals/resViewModalServices';
import { ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, RDFTypesEnum, ResAttribute } from './../../../models/ARTResources';
import { Language, Languages } from './../../../models/LanguagesCountries';
import { OntoLex, SKOS, SKOSXL } from './../../../models/Vocabulary';
import { CustomFormsServices } from './../../../services/customFormsServices';
import { ResourcesServices } from './../../../services/resourcesServices';
import { SkosServices } from './../../../services/skosServices';
import { SkosxlServices } from './../../../services/skosxlServices';
import { VBContext } from './../../../utils/VBContext';


@Component({
    selector: "lang-def",
    templateUrl: "./showLanguageDefinition.html",
    styleUrls: ["./showLanguageDefinition.css"]
})

export class ShowLanguageDefinitionComponent {

    @Input() langFromServer: string;
    @Input() langStruct: { [key: string]: ARTPredicateObjects[] };
    @Input() resource: ARTResource;
    @Input() customRange: boolean;
    @Output() update = new EventEmitter();
    @Output() delete = new EventEmitter(); //requires the parent to delete this component
    
    private lang: Language;
    private definitions: DefinitionStructView[]; // it is useful for method onDefinitionEdited
    private terms: TermStructView[]; // it is used to assign each term if it's a prefLabel or not
    private lexicalizationModelType: string;

    private emptyTerm: boolean; //tells if there is an empty term (eventually waiting to be filled or just emptied)
    private emptyDef: boolean; //tells if there is an empty definition  (eventually waiting to be filled or just emptied)

    //action auth
    private addDefAuthorized: boolean;
    private editDefAuthorized: boolean;
    private deleteDefAuthorized: boolean;
    private addLabelAuthorized: boolean;

    constructor(public el: ElementRef, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private resourcesService: ResourcesServices, private customFormsServices: CustomFormsServices,
        private propService: PropertyServices, private resViewModals: ResViewModalServices, 
        private basicModals: BasicModalServices, private creationModals: CreationModalServices) { }

    ngOnInit() {
        this.lexicalizationModelType = VBContext.getWorkingProject().getLexicalizationModelType();//it's useful to understand project lexicalization
        this.lang = Languages.getLanguageFromTag(this.langFromServer)
    }

    ngOnChanges(changes: SimpleChanges) {
        this.initializeDefinition();
        this.initializeTerms();

        if (changes['resource']) {
            let langAuthorized = VBContext.getProjectUserBinding().getLanguages().indexOf(this.langFromServer) != -1;
            //all the actions are authorized if user has authorization on the action itself and on the language envolved
            this.addLabelAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddLexicalization, this.resource) && langAuthorized;
            this.addDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddNote, this.resource) && langAuthorized;
            this.editDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, this.resource) && langAuthorized;
            this.deleteDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.resource) && langAuthorized;
        }
    }


    private initializeDefinition() {
        this.definitions = [];
        this.langStruct[this.langFromServer].forEach(po => {
            if (po.getPredicate().equals(SKOS.definition)) {
                if (po.getObjects().length != 0) {
                    po.getObjects().forEach(d => {
                        this.definitions.push({ object: d, predicate: po.getPredicate(), lang: this.langFromServer })
                    })
                }
            }
        })
        if (!this.langStruct[this.langFromServer].some(po => po.getPredicate().equals(SKOS.definition))) { // it creates empty box definition when user adds a new language
            this.definitions.push({ predicate: SKOS.definition, lang: this.langFromServer })
        }
        this.updateEmptyDef();
    }



    /**
    * This method manages update and add for definition
    * @param newDefValue (taken from view)
    */
    private onDefinitionEdited(newDefValue: string, oldDefValue: DefinitionStructView) {
        if (oldDefValue.object && oldDefValue.object.getShow() != newDefValue) { // update case 
            let newLitForm: ARTLiteral = new ARTLiteral(newDefValue, null, this.langFromServer);
            if (oldDefValue.object.isLiteral()) { // if standard
                this.resourcesService.updateTriple(this.resource, oldDefValue.predicate, oldDefValue.object, newLitForm).subscribe(
                    stResp => this.update.emit()
                )
            } else if (oldDefValue.predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE)) { // if reified
                this.customFormsServices.updateReifiedResourceShow(this.resource, oldDefValue.predicate, <ARTResource>oldDefValue.object, newLitForm).subscribe(
                    stResp => this.update.emit()
                )
            }

        } else if (newDefValue != null) { // new case
            let newLitForm: ARTLiteral = new ARTLiteral(newDefValue, null, this.langFromServer);
            this.resourcesService.addValue(this.resource, SKOS.definition, newLitForm).subscribe(
                stResp => this.update.emit()
            )
        }
    }


    /**
     * Delete a definition:
     * 1) if there are more than one definition it deletes entire definition box 
     * 2) if there is only one definition it deletes value but an empty box remains
     * @param defToDelete 
     */
    private deleteDefinition(defToDelete: DefinitionStructView) {
        if (defToDelete.object == null) {
            this.definitions.pop();
            this.updateEmptyDef();
        } else {
            let serviceInvocation: Observable<any>;
            if (defToDelete.object.isLiteral()) { // if standard
                serviceInvocation = this.resourcesService.removeValue(<ARTURIResource>this.resource, defToDelete.predicate, defToDelete.object);
            } else if (defToDelete.predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE)) { // if reified
                serviceInvocation = this.customFormsServices.removeReifiedResource(this.resource, defToDelete.predicate, defToDelete.object);
            }
            if (serviceInvocation != null) {
                serviceInvocation.subscribe(
                    () => {
                        //if the deleted definition was the only one and there are no terms, just empty the definition object
                        //and prevent to refresh the entire res view (otherwise the whole box disappears)
                        if (this.definitions.length == 1 && this.emptyTerm) {
                            defToDelete.object = null;
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
    private addDefinitionItem() {
        if (this.customRange) { //exists custom range(s) for skos:definition
            let predicate = SKOS.definition;
            this.propService.getRange(predicate).subscribe(
                (range: RangeResponse) => {
                    let ranges = range.ranges;
                    let customForms: CustomForm[] = range.formCollection.getForms();
                    //handle 2 cases: only CustomRange, both Custom and standard range (3rd case, only "standard", is excluded since @Input customRange is true)
                    if (ranges == null) { //only CustomRange
                        if (customForms.length == 1) { //just one CF in the collection => prompt it
                            this.addCustomFormDefinition(customForms[0]);
                        } else if (customForms.length > 1) { //multiple CF => ask which one to use
                            //prepare the range options with the custom range entries
                            this.basicModals.selectCustomForm("Select a Custom Range", customForms).then(
                                (selectedCF: CustomForm) => {
                                    this.addCustomFormDefinition(selectedCF);
                                },
                                () => { }
                            );
                        }
                    } else { //both standard and custom range
                        //workaroung tu include "literal" as choice in the CF selection modal
                        let rangeOptions: CustomForm[] = [new CustomForm(RDFTypesEnum.literal, RDFTypesEnum.literal)];
                        rangeOptions = rangeOptions.concat(customForms);
                        //ask the user to choose
                        this.basicModals.selectCustomForm("Select a range", rangeOptions).then(
                            (selectedCF: CustomForm) => {
                                if (selectedCF.getId() == RDFTypesEnum.literal) { //if selected range is "literal"
                                    this.addPlainDefinition();
                                } else { //user selected a custom range
                                    this.addCustomFormDefinition(selectedCF);
                                }
                            }
                        );
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
        this.definitions.push({ predicate: SKOS.definition, lang: this.langFromServer })
        this.updateEmptyDef();
    }

    /**
     * Open a modal for entering a new plain definition
     */
    private addPlainDefinition() {
        this.creationModals.newPlainLiteral("Add a definition", null, false, this.langFromServer, true).then(
            (literalDef: ARTLiteral) => {
                this.skosService.addNote(<ARTURIResource>this.resource, SKOS.definition, literalDef).subscribe(
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
        this.resViewModals.enrichCustomForm("Add " + SKOS.definition.getShow(), cf.getId(), this.langFromServer).then(
            (entryMap: { [key: string]: any }) => {
                let cfValue: CustomFormValue = new CustomFormValue(cf.getId(), entryMap);
                this.skosService.addNote(<ARTURIResource>this.resource, SKOS.definition, cfValue).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }



    // it needs to add ontolex part
    private initializeTerms() {
        this.terms = [];
        this.langStruct[this.langFromServer].forEach(po => {
            if (po.getPredicate().equals(SKOSXL.prefLabel) || po.getPredicate().equals(SKOS.prefLabel)) {
                if (po.getObjects().length != 0) {
                    po.getObjects().forEach(obj => {
                        this.terms.push({ object: obj, predicate: po.getPredicate(), isPrefLabel: true, lang: this.langFromServer })
                    })
                } else { //  always insert a prefLabel first both if there are no objects with a prefLabel predicate and if there are only objects with an altLabel type predicate
                    this.terms.push({ predicate: po.getPredicate(), isPrefLabel: true, lang: this.langFromServer })
                }
            } else if (po.getPredicate().equals(SKOSXL.altLabel) || po.getPredicate().equals(SKOS.altLabel)) {
                if (po.getObjects().length != 0) {
                    po.getObjects().forEach(obj => {
                        this.terms.push({ object: obj, predicate: po.getPredicate(), isPrefLabel: false, lang: this.langFromServer })
                    })
                }
            }

        })

        this.updateEmptyTerm();
    }


    // it needs to add ontolex part
    private addTermBox() {
        if (this.terms.some(term => term.predicate.equals(SKOSXL.prefLabel) || term.predicate.equals(SKOS.prefLabel))) { // it means that already there is a prefLabel predicate => so add an altLabel (with SKOS and SKOSXL)
            if (this.lexicalizationModelType == SKOSXL.uri) {
                this.terms.push({ predicate: SKOSXL.altLabel, lang: this.langFromServer })
                this.updateEmptyTerm();
            } else if (this.lexicalizationModelType == SKOS.uri) {
                this.terms.push({ predicate: SKOS.altLabel, lang: this.langFromServer })
                this.updateEmptyTerm();
            }
        } else { // contrary
            if (this.lexicalizationModelType == SKOSXL.uri) {
                this.terms.push({ predicate: SKOSXL.prefLabel, isPrefLabel: true, lang: this.langFromServer })
                this.sortPredicates(this.terms)
                this.updateEmptyTerm();
            } else if (this.lexicalizationModelType == SKOS.uri) {
                this.terms.push({ predicate: SKOS.prefLabel, isPrefLabel: true, lang: this.langFromServer })
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
            this.terms.pop()
            this.updateEmptyTerm();
        } else { // case in which a box is deleted and conteins a term with value
            this.terms.forEach(term => {
                if (term == termToDelete) {
                    if (this.definitions.length == 1 && this.definitions.some(def => def.object == null) && this.terms.length == 1) {  
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
     * When the object is edited or added requires update of res simple view 
     */
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
        this.emptyDef = this.definitions.some(d => d.object == null);
    }


}

export interface DefinitionStructView {
    object?: ARTNode;
    predicate?: ARTURIResource;
    lang?: string
}

export interface TermStructView {
    object?: ARTNode;
    predicate?: ARTURIResource;
    isPrefLabel?: boolean;
    lang?: string

}