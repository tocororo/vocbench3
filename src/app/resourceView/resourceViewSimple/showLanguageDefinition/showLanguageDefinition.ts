import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { CustomForm, CustomFormValue, FormCollection } from '../../../models/CustomForms';
import { PropertyServices, RangeResponse } from '../../../services/propertyServices';
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { ResViewModalServices } from '../../resourceViewEditor/resViewModals/resViewModalServices';
import { ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, RDFTypesEnum, ResAttribute } from './../../../models/ARTResources';
import { Language, Languages } from './../../../models/LanguagesCountries';
import { OntoLex, SKOS, SKOSXL } from './../../../models/Vocabulary';
import { CustomFormsServices } from './../../../services/customFormsServices';
import { ResourcesServices } from './../../../services/resourcesServices';
import { SkosServices } from './../../../services/skosServices';
import { SkosxlServices } from './../../../services/skosxlServices';

@Component({
    selector: "lang-def",
    templateUrl: "./showLanguageDefinition.html",
    styleUrls: ["./showLanguageDefinition.css"]
})

export class ShowLanguageDefinitionComponent {

    partitionCollapsed: boolean = false;
    @Input() langFromServer: string;
    @Input() langStruct: { [key: string]: ARTPredicateObjects[] };
    @Input() resource: ARTResource;
    @Input() lexicalizationModelType: string;
    @Output() update = new EventEmitter();
    private lang: Language;
    private definitions: DefinitionStructView[]; // it is util for method onDefinitionEdited
    private defOnView: string[] = [];// it is util to pass value (string) to the view
    private terms: TermStructView[]; // it is used to assign each term if it's a prefLabel or not
    private disabled: boolean;
    private disabledAddDef: boolean; // it is used to disable link inside dropdown



    constructor(public el: ElementRef, private skosService: SkosServices, private skosxlService: SkosxlServices, 
        private resourcesService: ResourcesServices, private customFormsServices: CustomFormsServices,
        private propService: PropertyServices, private resViewModals: ResViewModalServices, private basicModals: BasicModalServices) { }

    ngOnChanges() {
        this.lang = Languages.getLanguageFromTag(this.langFromServer)
        this.initializeDefinition();
        this.initializeTerms();
        this.disabled = false;
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
                this.disabledAddDef=false;
            }
        })
        if (!this.langStruct[this.langFromServer].some(po => po.getPredicate().equals(SKOS.definition))) { // it creates empty box definition when user adds a new language
            this.definitions.push({ predicate: SKOS.definition, lang: this.langFromServer })
            this.disabledAddDef=true;
        }

    }

    

    /**
    * This method manages update and add for definition
    * @param newDefValue (taken from view)
    */
    private onDefinitionEdited(newDefValue: string, oldDefValue: DefinitionStructView) {
        if (oldDefValue.object && oldDefValue.object.getShow() != newDefValue) { // update case 
            let newLitForm: ARTLiteral = new ARTLiteral(newDefValue, null, this.langFromServer);
            if(oldDefValue.object.isLiteral()){ // if standard
                this.resourcesService.updateTriple(this.resource, oldDefValue.predicate, oldDefValue.object, newLitForm).subscribe(
                    stResp => this.update.emit()
                )
            }else if(oldDefValue.predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE)){ // if reified
                this.customFormsServices.updateReifiedResourceShow(this.resource, oldDefValue.predicate, <ARTResource>oldDefValue.object, newLitForm).subscribe(
                    stResp => this.update.emit()
                )
            }
           
        } else if (newDefValue != null) { // new case
            let newLitForm: ARTLiteral = new ARTLiteral(newDefValue, null, this.langFromServer);
            this.resourcesService.addValue(this.resource, SKOS.definition, newLitForm).subscribe(
                stResp => this.update.emit()
            )
            this.disabledAddDef=false;
        }

    }


   /**
    * Delete a definition:
    * 1) if there are more then one definitions it deletes entire box 
    * 2) if there is only one definition it delets value but an empty box remains
    * @param defToDelete 
    */

    private deleteDefinition(defToDelete:DefinitionStructView ) {
        this.disabledAddDef=false;
        if(this.definitions.length > 1 && defToDelete.object != null){
            if(defToDelete.object.isLiteral()){ // if standard
                this.resourcesService.removeValue(<ARTURIResource>this.resource, defToDelete.predicate, defToDelete.object).subscribe(
                    stResp => this.update.emit()
                )
            }else if(defToDelete.predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE)){ // if reified
                this.customFormsServices.removeReifiedResource(this.resource, defToDelete.predicate, defToDelete.object ).subscribe(
                    stResp => this.update.emit()
                )
            }
           
        }else if( this.definitions.length > 1 && defToDelete.object== null){
            this.definitions.pop()
        } else if(defToDelete.object != null) {
            if(defToDelete.object.isLiteral()){ // if standard
                this.resourcesService.removeValue(<ARTURIResource>this.resource, defToDelete.predicate, defToDelete.object).subscribe(
                    stResp => this.update.emit()
                )
            }else if(defToDelete.predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE)){ // if reified
                this.customFormsServices.removeReifiedResource(this.resource, defToDelete.predicate, defToDelete.object ).subscribe(
                    stResp => this.update.emit()
                )
            }
        }
    }


    /**
     *  Add a new empty box definition
     */
    private addDefinitionItem(){
        let predicate = SKOS.definition;
        this.propService.getRange(predicate).subscribe(
            (range: RangeResponse) => {
                let ranges = range.ranges;
                let formCollection: FormCollection = range.formCollection;
                //handle 3 cases: only CustomRange, only "standard" range, both Custom and standard range
                if (ranges != null && formCollection == null) { //only standard range => simply add a new field
                    this.addPlainDefinition();
                } else if (ranges == null && formCollection != null) { //only CustomRange
                    let forms = formCollection.getForms();
                    if (forms.length == 1) { //just one CF in the collection => prompt it
                        this.addCustomFormDefinition(forms[0]);
                    } else if (forms.length > 1) { //multiple CF => ask which one to use
                        //prepare the range options with the custom range entries
                        this.basicModals.selectCustomForm("Select a Custom Range", forms).then(
                            (selectedCF: CustomForm) => {
                                this.addCustomFormDefinition(selectedCF);
                            },
                            () => {}
                        );
                    } else { //no CR linked to the property has no Entries => error
                        this.basicModals.alert("Error", "The FormCollection " + formCollection.getId() + ", linked to property " 
                            + predicate.getShow() + ", doesn't contain any CustomForm", "error");
                    }
                } else { //both standard and custom range
                    //workaroung tu include "literal" as choice in the CF selection modal
                    let rangeOptions: CustomForm[] = [new CustomForm(RDFTypesEnum.literal, RDFTypesEnum.literal)];
                    let customForms: CustomForm[] = formCollection.getForms();
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
    }

    /**
     * Add a new empty box definition
     */
    private addPlainDefinition() {
        this.definitions.push({ predicate: SKOS.definition, lang: this.langFromServer })
        this.disabledAddDef=true;
    }

    /**
     * Create a definition through a CF
     * @param cf 
     */
    private addCustomFormDefinition(cf: CustomForm) {
        this.resViewModals.enrichCustomForm("Add " + SKOS.definition.getShow(), cf.getId()).then(
            (entryMap: {[key: string]: any}) => {
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

    }


    // it needs to add ontolex part
    private addTermBox() {
        if (this.langStruct[this.langFromServer].some(po => po.getPredicate().equals(SKOSXL.prefLabel) || po.getPredicate().equals(SKOS.prefLabel))) { // it means that already there is a prefLabel predicate => so add an altLabel (with SKOS and SKOSXL)
            if (this.lexicalizationModelType == SKOSXL.uri) {
                this.terms.push({ predicate: SKOSXL.altLabel, lang: this.langFromServer })
                this.disabledAddButton()
            } else if (this.lexicalizationModelType == SKOS.uri) {
                this.terms.push({ predicate: SKOS.altLabel, lang: this.langFromServer })
                this.disabledAddButton()
            }
        } else { // contrary
            if (this.lexicalizationModelType == SKOSXL.uri) {
                this.terms.push({ predicate: SKOSXL.prefLabel, isPrefLabel: true, lang: this.langFromServer })
                this.sortPredicates(this.terms)
                this.disabledAddButton()
            } else if (this.lexicalizationModelType == SKOS.uri) {
                this.terms.push({ predicate: SKOS.prefLabel, isPrefLabel: true, lang: this.langFromServer })
                this.sortPredicates(this.terms)
                this.disabledAddButton()
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
            this.disabled = false // reactive add button
        } else { // case in which a box is deleted and conteins a term with value
            this.langStruct[this.langFromServer].forEach(po => {
                if (po.getObjects().some(obj => obj.equals(termToDelete.object))) {
                    let found = po.getObjects().find(o => o.equals(termToDelete.object))
                    if (po.getPredicate().equals(SKOSXL.prefLabel)) {
                        this.skosxlService.removePrefLabel(<ARTURIResource>this.resource, <ARTResource>found).subscribe(
                            stResp => this.update.emit()
                        )
                    } else if (po.getPredicate().equals(SKOSXL.altLabel)) {
                        this.skosxlService.removeAltLabel(<ARTURIResource>this.resource, <ARTResource>found).subscribe(
                            stResp => this.update.emit()
                        )
                    } else if (po.getPredicate().equals(SKOS.prefLabel)) {
                        this.skosService.removePrefLabel(<ARTURIResource>this.resource, <ARTLiteral>found).subscribe(
                            stResp => this.update.emit()
                        )
                    } else if (po.getPredicate().equals(SKOS.altLabel)) {
                        this.skosService.removeAltLabel(<ARTURIResource>this.resource, <ARTLiteral>found).subscribe(
                            stResp => this.update.emit()
                        )

                    }
                }
            })
        }

    }



    /**
     * This method manages "add button" status
     */
    private disabledAddButton() {
        this.terms.forEach(t => {
            if (t.object == null) {
                this.disabled = true
            }
        })

    }

    /**
     * When the object is edited or added requires update of res simple view 
     */
    private onTermUpdate() {
        this.update.emit();
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