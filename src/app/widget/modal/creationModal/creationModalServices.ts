import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ARTLiteral, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { LanguageConstraint } from '../../../models/LanguagesCountries';
import { ModalOptions } from '../Modals';
import { NewPlainLiteralModal } from "./newPlainLiteralModal/newPlainLiteralModal";
import { NewLexiconCfModal } from './newResourceModal/ontolex/newLexiconCfModal';
import { NewOntoLexicalizationCfModal } from './newResourceModal/ontolex/newOntoLexicalizationCfModal';
import { NewResourceCfModal } from "./newResourceModal/shared/newResourceCfModal";
import { NewResourceWithLiteralCfModal } from './newResourceModal/shared/newResourceWithLiteralCfModal';
import { NewConceptCfModal } from './newResourceModal/skos/newConceptCfModal';
import { NewConceptFromLabelModal } from "./newResourceModal/skos/newConceptFromLabelModal";
import { NewXLabelModal } from './newResourceModal/skos/newXLabelModal';
import { NewTypedLiteralModal } from "./newTypedLiteralModal/newTypedLiteralModal";

@Injectable()
export class CreationModalServices {

    constructor(private modalService: NgbModal) { }

    /**
     * Opens a modal to create a new resource with uri plus custom form supplement fields
     * @param title the title of the modal dialog
     * @param cls class of the new creating resource
     * @param clsChangeable tells if the class of the creating resource can be changed
     * @param cfId the custom form id
     * @return
     */
    newResourceCf(title: string, cls: ARTURIResource, clsChangeable?: boolean) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewResourceCfModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.cls = cls;
        modalRef.componentInstance.clsChangeable = clsChangeable;
        return modalRef.result;
    }

    /**
     * Opens a modal to create a new resource with uri, a language tagged literal (label?), plus custom form supplement fields
     * @param title the title of the modal dialog
     * @param cls class of the new creating resource
     * @param clsChangeable tells if the class of the creating resource can be changed
     * @param literalLabel the label of the literal field (default "Label")
     * @param lang the selected default language in the lang-picker of the modal. If not provided, set the default VB language
     * @param langConstraints constraints to apply to the lang
     * @return
     */
    newResourceWithLiteralCf(title: string, cls: ARTURIResource, clsChangeable?: boolean, literalLabel?: string,
        lang?: string, langConstraints?: LanguageConstraint) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewResourceWithLiteralCfModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.cls = cls;
        modalRef.componentInstance.clsChangeable = clsChangeable;
        modalRef.componentInstance.literalLabel = literalLabel;
        modalRef.componentInstance.lang = lang;
        modalRef.componentInstance.langConstraints = langConstraints;
        return modalRef.result;
    }

    /**
     * Opens a modal to create a new skos concept with label, language, uri (optional) and schemes, plus custom form supplement fields
     * @param title the title of the modal dialog
     * @param broader the broader concept of the new creating (only if not topConcept)
     * @param schemes the schemes to which the new concept should belong (if not provided, schemes will be the broader's schemes if provided)
     * @param cls class of the new creating concept
     * @param clsChangeable tells if the class of the creating resource can be changed
     * @param lang the selected default language in the lang-picker of the modal. If not provided, set the default VB language
     * @return 
     */
    newConceptCf(title: string, broader?: ARTURIResource, schemes?: ARTURIResource[], cls?: ARTURIResource, clsChangeable?: boolean, lang?: string) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewConceptCfModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.broader = broader;
        modalRef.componentInstance.schemes = schemes;
        modalRef.componentInstance.cls = cls;
        modalRef.componentInstance.clsChangeable = clsChangeable;
        modalRef.componentInstance.lang = lang;
        return modalRef.result;
    }

    /**
     * Opens a modal to create a new ontolex lexicon
     * @param title 
     * @param clsChangeable 
     */
    newLexiconCf(title: string, clsChangeable?: boolean) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewLexiconCfModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.clsChangeable = clsChangeable;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param lexicalizationProp determines which type of lexicalization should create
     *  (OntoLex.senses | OntoLex.denotes | Ontolex.isDenotedBy)
     * @param clsChangeable 
     */
    newOntoLexicalizationCf(title: string, lexicalizationProp: ARTURIResource, clsChangeable?: boolean) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewOntoLexicalizationCfModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.lexicalizationProp = lexicalizationProp;
        modalRef.componentInstance.clsChangeable = clsChangeable;
        return modalRef.result;
    }

    /**
     * Opens a modal to create a new xLabel
     * @param title the title of the modal dialog
     * @param value the value inserted by default
     * @param valueReadonly if true the input field is disable and cannot be changed
     * @param lang the language selected as default
     * @param langReadonly if true the language selection is disable and language cannot be changed
     * @param clsChangeable tells if the class of the creating resource can be changed
     * @param multivalueOpt options about the creation of multiple labels
     * @return if the modal closes with ok returns a promise containing an object with label and cls
     */
    newXLabel(title: string, value?: string, valueReadonly?: boolean, lang?: string, langReadonly?: boolean,
        clsChangeable?: boolean, multivalueOpt?: { enabled: boolean, allowSameLang: boolean }) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewXLabelModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.value = value;
        modalRef.componentInstance.valueReadonly = valueReadonly;
        modalRef.componentInstance.lang = lang;
        modalRef.componentInstance.langReadonly = langReadonly;
        modalRef.componentInstance.clsChangeable = clsChangeable;
        modalRef.componentInstance.multivalueOpt = multivalueOpt;
        return modalRef.result;
    }

    /**
     * Opens a modal to create a new literal with language tag
     * @param title the title of the modal dialog
     * @param value the value inserted by default
     * @param valueReadonly if true the input field is disable and cannot be changed
     * @param lang the language selected as default
     * @param langReadonly if true the language selection is disable and language cannot be changed
     * @param langConstraints constraints to apply to the lang
     * @param multivalueOpt options about the creation of multiple labels
     * @return if the modal closes with ok returns a promise containing an ARTLiteral
     */
    newPlainLiteral(title: string, value?: string, valueReadonly?: boolean, lang?: string, langReadonly?: boolean,
        langConstraints?: LanguageConstraint, multivalueOpt?: { enabled: boolean, allowSameLang: boolean }) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewPlainLiteralModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.value = value;
        modalRef.componentInstance.valueReadonly = valueReadonly;
        modalRef.componentInstance.lang = lang;
        modalRef.componentInstance.langReadonly = langReadonly;
        modalRef.componentInstance.langConstraints = langConstraints;
        modalRef.componentInstance.multivalueOpt = multivalueOpt;
        return modalRef.result;
    }

    /**
     * Opens a modal to create a new literal with datatype
     * @param title the title of the modal dialog
     * @param predicate the (optional) predicate that is going to enrich with the typed literal
     * @param allowedDatatypes datatypes allowed in the datatype selection list
     * @param dataRanges if provided, tells which values can be created/chosed (e.g. xml:string ["male", "female"])
     * @param multivalue if true, allows multiple literal creation
     * @param validation if true, validates the provided value according the datatype
     * @return if the modal closes with ok returns a promise containing an ARTLiteral
     */
    newTypedLiteral(title: string, predicate?: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[], multivalue?: boolean, validation?: boolean) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewTypedLiteralModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.predicate = predicate;
        modalRef.componentInstance.allowedDatatypes = allowedDatatypes;
        modalRef.componentInstance.dataRanges = dataRanges;
        modalRef.componentInstance.multivalue = multivalue;
        modalRef.componentInstance.validate = validation;
        return modalRef.result;
    }

    /**
     * Opens a modal to create a new concept with a preset skosxl:Label
     * @param title the title of the modal dialog
     * @param xLabel label that the new concept will have
     * @param cls class of the new creating resource
     * @param clsChangeable tells if the class of the creating resource can be changed
     * @param sibling a concept that if provided, set the default sibling in case of position chosen "sibling"
     */
    newConceptFromLabel(title: string, xLabel: ARTResource, cls: ARTURIResource, clsChangeable?: boolean, sibling?: ARTURIResource) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewConceptFromLabelModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.xLabel = xLabel;
        modalRef.componentInstance.cls = cls;
        modalRef.componentInstance.clsChangeable = clsChangeable;
        modalRef.componentInstance.sibling = sibling;
        return modalRef.result;
    }

}