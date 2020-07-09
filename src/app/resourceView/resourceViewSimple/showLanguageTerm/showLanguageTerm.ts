import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ARTLiteral, ARTResource } from '../../../models/ARTResources';
import { ARTURIResource } from './../../../models/ARTResources';
import { OntoLex, SKOS, SKOSXL } from './../../../models/Vocabulary';
import { ResourcesServices } from './../../../services/resourcesServices';
import { SkosServices } from './../../../services/skosServices';
import { SkosxlServices } from './../../../services/skosxlServices';
import { VBContext } from './../../../utils/VBContext';
import { TermStructView } from './../showLanguageDefinition/showLanguageDefinition';

@Component({
    selector: "lang-term",
    templateUrl: "./showLanguageTerm.html",
    styleUrls: ["./showLanguageTerm.css"]
    //host: { class: "vbox" }
})


export class ShowLanguageTermComponent {
    @Input() termToShow: TermStructView;
    @Input() isEmptyTermsList: boolean;
    @Input() resource: ARTResource;
    @Output() termToDelete = new EventEmitter();
    @Output() update = new EventEmitter();
    private termValue: string
    private focus: boolean;
    private lexicalizationModelType: string;


    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private resourcesService: ResourcesServices) { }


    ngOnChanges() {
        this.lexicalizationModelType = VBContext.getWorkingProject().getLexicalizationModelType();//it's useful to understand project lexicalization
        this.initializeTerm();
    }

    private initializeTerm() {
        if (this.termToShow.object) {
            this.termValue = this.termToShow.object.getShow()
            this.focus = false
        } else {
            this.termValue = null
            this.focus = true
        }
    }

    /**
     * Take term to delete from view and pass value to parent component which manages real delete operation
     * @param termToShow 
     */
    private deleteTermBox(termFromView: TermStructView) {
        this.termToDelete.emit(termFromView)
    }

    /**
     * This method allows to edit an object term taken from the view or to add a new term
     * @param newValue 
     */
    private onValueEdited(newValue: string) {
        let oldValue = this.termValue
        if (this.termToShow.object) { // case update an existing term
            if (this.lexicalizationModelType == SKOSXL.uri) {
                if (oldValue != newValue) {
                    let oldLitForm: ARTLiteral = new ARTLiteral(oldValue, null, this.termToShow.lang);
                    let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.termToShow.lang);
                    this.resourcesService.updateLexicalization(<ARTResource>this.termToShow.object, SKOSXL.literalForm, oldLitForm, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == SKOS.uri) {
                if (oldValue != newValue) {
                    let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.termToShow.lang);
                    this.resourcesService.updateLexicalization(<ARTResource>this.resource, this.termToShow.predicate, <ARTLiteral>this.termToShow.object, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == OntoLex.uri) {

            }
        } else { // case add a new term
            if (this.lexicalizationModelType == SKOSXL.uri) {
                if (this.termToShow.predicate.equals(SKOSXL.prefLabel) && oldValue == null) {
                    let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.termToShow.lang);
                    this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                } else if (this.termToShow.predicate.equals(SKOSXL.altLabel)) {
                    let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.termToShow.lang);
                    this.skosxlService.addAltLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == SKOS.uri) {
                if (this.termToShow.predicate.equals(SKOS.prefLabel)) {
                    let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.termToShow.lang);
                    this.skosService.setPrefLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                } else if (this.termToShow.predicate.equals(SKOS.altLabel)) {
                    let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.termToShow.lang);
                    this.skosService.addAltLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == OntoLex.uri) {

            }

        }


    }




}