import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { PrefLabelClashMode } from 'src/app/models/Properties';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTLiteral, ARTResource, ARTURIResource } from '../../../models/ARTResources';
import { SKOS, SKOSXL } from '../../../models/Vocabulary';
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

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private resourcesService: ResourcesServices,
        private basicModals: BasicModalServices, private translateService: TranslateService) { }

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
            }
        } else { // case add a new term
            if (this.lexicalizationModelType == SKOSXL.uri) {
                let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.term.lang);
                if (this.term.predicate.equals(SKOSXL.prefLabel)) {
                    this.setPrefLabel(<ARTURIResource>this.resource, newLitForm);
                } else if (this.term.predicate.equals(SKOSXL.altLabel)) {
                    this.skosxlService.addAltLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        () => this.update.emit()
                    )
                }
            } else if (this.lexicalizationModelType == SKOS.uri) {
                let newLitForm: ARTLiteral = new ARTLiteral(newValue, null, this.term.lang);
                if (this.term.predicate.equals(SKOS.prefLabel)) {
                    this.setPrefLabel(<ARTURIResource>this.resource, newLitForm);
                } else if (this.term.predicate.equals(SKOS.altLabel)) {
                    this.skosService.addAltLabel(<ARTURIResource>this.resource, newLitForm).subscribe(
                        () => this.update.emit()
                    )
                }
            }
        }
    }

    setPrefLabel(resource: ARTURIResource, label: ARTLiteral, checkAlt?: boolean, checkPref?: boolean) {
        let prefLabelClashMode = VBContext.getWorkingProjectCtx().getProjectSettings().prefLabelClashMode;
        if (checkPref == null) {
            checkPref = prefLabelClashMode != PrefLabelClashMode.allow; //if not "allow" (forbid or warning) enable the check
        }

        let setPrefLabelFn: Observable<void>;
        if (this.lexicalizationModelType == SKOS.uri) {
            setPrefLabelFn = this.skosService.setPrefLabel(resource, label, checkAlt, checkPref);
        } else { //skosxl
            setPrefLabelFn = this.skosxlService.setPrefLabel(resource, label, null, checkAlt, checkPref);
        }
        setPrefLabelFn.subscribe(
            () => {
                this.update.emit()
            },
            (err: Error) => {
                if (err.name.endsWith("PrefPrefLabelClashException")) {
                    let msg = err.message;
                    if (prefLabelClashMode == PrefLabelClashMode.warning) { //mode warning => ask user if he wants to force the operation
                        msg += ". " + this.translateService.instant("MESSAGES.FORCE_OPERATION_CONFIRM");
                        this.basicModals.confirm({key:"STATUS.WARNING"}, msg, ModalType.warning).then(
                            confirm => {
                                this.setPrefLabel(resource, label, null, false);
                            },
                            reject => {
                                this.delete.emit();
                            }
                        );
                    } else { //mode forbid => just show the error message
                        this.basicModals.alert({key:"STATUS.WARNING"}, msg, ModalType.warning)
                    }
                } else if (err.name.endsWith("PrefAltLabelClashException")) {
                    let msg = err.message + " " + this.translateService.instant("MESSAGES.FORCE_OPERATION_CONFIRM");
                    this.basicModals.confirm({key:"STATUS.WARNING"}, msg, ModalType.warning).then(
                        confirm => {
                            this.setPrefLabel(resource, label, false);
                        },
                        reject => {
                            this.delete.emit();
                        }
                    );
                } else {
                    this.basicModals.alert({key:"STATUS.ERROR"}, err.message, ModalType.warning);
                    this.delete.emit();
                }
            }

        )
    }




}