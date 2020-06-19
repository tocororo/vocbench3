import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource } from './../../../models/ARTResources';
import { Language, Languages } from './../../../models/LanguagesCountries';
import { SKOS, SKOSXL, OntoLex } from './../../../models/Vocabulary';
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
    private definition: ARTNode; // it is util for method onDefinitionEdited
    private defOnView: string;// it is util to pass value (string) to the view
    private terms: TermStructView[]; // it is used to assign each term if it's a prefLabel or not
    private disabled: boolean;




    constructor(public el: ElementRef, private skosService: SkosServices, private skosxlService: SkosxlServices, private resourcesService: ResourcesServices) { }

    ngOnChanges() {
        this.lang = Languages.getLanguageFromTag(this.langFromServer)
        this.initializeDefinition();
        this.initializeTerms();
        this.disabled=false;
    }

    private initializeDefinition() {
        this.langStruct[this.langFromServer].forEach(po => {
            if (po.getPredicate().equals(SKOS.definition)) {
                po.getObjects().forEach(d => {
                    if (d.getShow != null) {
                        this.definition = d 
                        this.defOnView = d.getShow() 
                    } else {
                        this.defOnView = null
                    }

                })
            }
        })


    }

     /**
     * This method manages update and add for definition
     * @param newDefValue (taken from view)
     */

    private onDefinitionEdited(newDefValue: string) {
        let oldDefValue = this.defOnView
        if (this.definition && oldDefValue != newDefValue) { // update case
            let newLitForm: ARTLiteral = new ARTLiteral(newDefValue, null, this.langFromServer);
            this.resourcesService.updateTriple(this.resource, SKOS.definition, <ARTLiteral>this.definition, newLitForm).subscribe(
                stResp => this.update.emit()
            )
        } else if (newDefValue != null) { // new case
            let newLitForm: ARTLiteral = new ARTLiteral(newDefValue, null, this.langFromServer);
            this.resourcesService.addValue(this.resource, SKOS.definition, newLitForm).subscribe(
                stResp => this.update.emit()
            )
        }

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
                this.terms.push({ predicate: SKOSXL.altLabel, lang:this.langFromServer})
                this.disabledAddButton()
            } else if (this.lexicalizationModelType == SKOS.uri) {
                this.terms.push({ predicate: SKOS.altLabel, lang:this.langFromServer})
                this.disabledAddButton()
            }
        } else { // contrary
            if (this.lexicalizationModelType == SKOSXL.uri) {
                this.terms.push({ predicate: SKOSXL.prefLabel, isPrefLabel: true, lang:this.langFromServer })
                this.sortPredicates(this.terms)
                this.disabledAddButton()
            } else if (this.lexicalizationModelType == SKOS.uri) {
                this.terms.push({ predicate: SKOS.prefLabel, isPrefLabel: true, lang:this.langFromServer })
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
            list.sort((second:TermStructView, first: TermStructView) => {
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
                if (t.object == null ) {
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

export interface TermStructView {
    object?: ARTNode;
    predicate?: ARTURIResource;
    isPrefLabel?: boolean;
    lang?: string

}