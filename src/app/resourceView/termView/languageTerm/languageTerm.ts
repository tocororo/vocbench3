import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ARTLiteral, ARTResource, ARTURIResource } from '../../../models/ARTResources';
import { OntoLex, SKOS, SKOSXL } from '../../../models/Vocabulary';
import { ResourcesServices } from '../../../services/resourcesServices';
import { SkosServices } from '../../../services/skosServices';
import { SkosxlServices } from '../../../services/skosxlServices';
import { AuthorizationEvaluator } from '../../../utils/AuthorizationEvaluator';
import { ResourceUtils } from '../../../utils/ResourceUtils';
import { VBActionsEnum } from '../../../utils/VBActions';
import { VBContext } from '../../../utils/VBContext';
import { TermStructView } from '../languageBox/languageBoxComponent';

@Component({
    selector: "lang-term",
    templateUrl: "./languageTerm.html",
    styleUrls: ["./languageTerm.css"]
})


export class LanguageTermComponent {
    @Input() term: TermStructView;
    @Input() resource: ARTResource;
    @Input() lang: string;
    @Input() readonly: boolean;
    @Output() delete: EventEmitter<void> = new EventEmitter();
    @Output() update = new EventEmitter();

    focus: boolean;
    private lexicalizationModelType: string;

    editTermAuthorized: boolean;
    deleteTermAuthorized: boolean;

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private resourcesService: ResourcesServices) { }

    ngOnInit() {
        this.lexicalizationModelType = VBContext.getWorkingProject().getLexicalizationModelType();//it's useful to understand project lexicalization
        this.focus = this.term.object == null;
    }

    ngOnChanges() {
        let tripleInStaging = (this.term.object != null) ? ResourceUtils.isTripleInStaging(this.term.object) : false;
        let langAuthorized = VBContext.getLoggedUser().isAdmin() || VBContext.getProjectUserBinding().getLanguages().indexOf(this.lang) != -1;
        this.editTermAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateLexicalization, this.resource) && langAuthorized && !tripleInStaging;
        this.deleteTermAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveLexicalization, this.resource) && langAuthorized && !tripleInStaging;
    }

    /**
     * Take term to delete from view and pass value to parent component which manages real delete operation
     * @param termToShow 
     */
    deleteTermBox() {
        this.delete.emit();
    }

    /**
     * This method allows to edit an object term taken from the view or to add a new term
     * @param newValue 
     */
    onValueEdited(newValue: string) {
        if (this.term.object) { // case update an existing term
            let oldValue = this.term.object.getShow();
            if (this.lexicalizationModelType == SKOSXL.uri) {
                if (oldValue != newValue) {
                    let oldLitForm: ARTLiteral = new ARTLiteral(oldValue, null, this.term.lang);
                    let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.term.lang);
                    this.resourcesService.updateLexicalization(<ARTResource>this.term.object, SKOSXL.literalForm, oldLitForm, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == SKOS.uri) {
                if (oldValue != newValue) {
                    let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.term.lang);
                    this.resourcesService.updateLexicalization(<ARTResource>this.resource, this.term.predicate, <ARTLiteral>this.term.object, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == OntoLex.uri) {

            }
        } else { // case add a new term
            if (this.lexicalizationModelType == SKOSXL.uri) {
                let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.term.lang);
                if (this.term.predicate.equals(SKOSXL.prefLabel)) {
                    this.skosxlService.setPrefLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                } else if (this.term.predicate.equals(SKOSXL.altLabel)) {
                    this.skosxlService.addAltLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == SKOS.uri) {
                let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.term.lang);
                if (this.term.predicate.equals(SKOS.prefLabel)) {
                    this.skosService.setPrefLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                } else if (this.term.predicate.equals(SKOS.altLabel)) {
                    this.skosService.addAltLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        stResp => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == OntoLex.uri) {

            }

        }


    }




}