import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ARTLiteral, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { LanguageConstraint } from '../../../models/LanguagesCountries';
import { ModalOptions, TextOrTranslation } from '../Modals';
import { NewPlainLiteralModal } from "./newPlainLiteralModal/newPlainLiteralModal";
import { NewConceptualizationCfModal } from './newResourceModal/ontolex/newConceptualizationCfModal';
import { NewLexiconCfModal } from './newResourceModal/ontolex/newLexiconCfModal';
import { NewOntoLexicalizationCfModal } from './newResourceModal/ontolex/newOntoLexicalizationCfModal';
import { NewResourceCfModal, NewResourceCfModalReturnData } from "./newResourceModal/shared/newResourceCfModal";
import { NewResourceWithLiteralCfModal } from './newResourceModal/shared/newResourceWithLiteralCfModal';
import { NewConceptCfModal } from './newResourceModal/skos/newConceptCfModal';
import { NewConceptFromLabelModal } from "./newResourceModal/skos/newConceptFromLabelModal";
import { NewXLabelModal } from './newResourceModal/skos/newXLabelModal';
import { NewTypedLiteralModal } from "./newTypedLiteralModal/newTypedLiteralModal";

@Injectable()
export class CreationModalServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    /**
     * Opens a modal to create a new resource with uri plus custom form supplement fields
     * @param title the title of the modal dialog
     * @param cls class of the new creating resource
     * @param clsChangeable tells if the class of the creating resource can be changed
     * @param cfId the custom form id
     * @return
     */
    newResourceCf(title: TextOrTranslation, cls: ARTURIResource, clsChangeable?: boolean, uriOptional?: boolean): Promise<NewResourceCfModalReturnData> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewResourceCfModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.cls = cls;
        if (clsChangeable != null) modalRef.componentInstance.clsChangeable = clsChangeable;
        if (uriOptional != null) modalRef.componentInstance.uriOptional = uriOptional;
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
    newResourceWithLiteralCf(title: TextOrTranslation, cls: ARTURIResource, clsChangeable?: boolean, literalLabel?: string,
        lang?: string, langConstraints?: LanguageConstraint) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewResourceWithLiteralCfModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.cls = cls;
        if (clsChangeable != null) modalRef.componentInstance.clsChangeable = clsChangeable;
        if (literalLabel != null) modalRef.componentInstance.literalLabel = literalLabel;
        if (lang != null) modalRef.componentInstance.lang = lang;
        if (langConstraints != null) modalRef.componentInstance.langConstraints = langConstraints;
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
    newConceptCf(title: TextOrTranslation, broader?: ARTURIResource, schemes?: ARTURIResource[], cls?: ARTURIResource, clsChangeable?: boolean, lang?: string) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewConceptCfModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (broader != null) modalRef.componentInstance.broader = broader;
        if (schemes != null) modalRef.componentInstance.schemes = schemes;
        if (cls != null) modalRef.componentInstance.cls = cls;
        if (clsChangeable != null) modalRef.componentInstance.clsChangeable = clsChangeable;
        if (lang != null) modalRef.componentInstance.lang = lang;
        return modalRef.result;
    }

    /**
     * Opens a modal to create a new ontolex lexicon
     * @param title 
     * @param clsChangeable 
     */
    newLexiconCf(title: TextOrTranslation, clsChangeable?: boolean) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewLexiconCfModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (clsChangeable != null) modalRef.componentInstance.clsChangeable = clsChangeable;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param lexicalizationProp determines which type of lexicalization should create
     *  (OntoLex.senses | OntoLex.denotes | Ontolex.isDenotedBy)
     * @param clsChangeable 
     */
    newOntoLexicalizationCf(title: TextOrTranslation, lexicalizationProp: ARTURIResource, clsChangeable?: boolean) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewOntoLexicalizationCfModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.lexicalizationProp = lexicalizationProp;
        if (clsChangeable != null) modalRef.componentInstance.clsChangeable = clsChangeable;
        return modalRef.result;
    }

    newConceptualizationCf(title: TextOrTranslation, clsChangeable?: boolean) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewConceptualizationCfModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (clsChangeable != null) modalRef.componentInstance.clsChangeable = clsChangeable;
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
    newXLabel(title: TextOrTranslation, value?: string, valueReadonly?: boolean, lang?: string, langReadonly?: boolean,
        clsChangeable?: boolean, multivalueOpt?: { enabled: boolean, allowSameLang: boolean }) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewXLabelModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (value != null) modalRef.componentInstance.value = value;
        if (valueReadonly != null) modalRef.componentInstance.valueReadonly = valueReadonly;
        if (lang != null) modalRef.componentInstance.lang = lang;
        if (langReadonly != null) modalRef.componentInstance.langReadonly = langReadonly;
        if (clsChangeable != null) modalRef.componentInstance.clsChangeable = clsChangeable;
        if (multivalueOpt != null) modalRef.componentInstance.multivalueOpt = multivalueOpt;
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
    newPlainLiteral(title: TextOrTranslation, value?: string, valueReadonly?: boolean, lang?: string, langReadonly?: boolean,
        langConstraints?: LanguageConstraint, multivalueOpt?: { enabled: boolean, allowSameLang: boolean }) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewPlainLiteralModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (value != null) modalRef.componentInstance.value = value;
        if (valueReadonly != null) modalRef.componentInstance.valueReadonly = valueReadonly;
        if (lang != null) modalRef.componentInstance.lang = lang;
        if (langReadonly != null) modalRef.componentInstance.langReadonly = langReadonly;
        if (langConstraints != null) modalRef.componentInstance.langConstraints = langConstraints;
        if (multivalueOpt != null) modalRef.componentInstance.multivalueOpt = multivalueOpt;
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
    newTypedLiteral(title: TextOrTranslation, predicate?: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[], multivalue?: boolean, validation?: boolean) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewTypedLiteralModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (predicate != null) modalRef.componentInstance.predicate = predicate;
        if (allowedDatatypes != null) modalRef.componentInstance.allowedDatatypes = allowedDatatypes;
        if (dataRanges != null) modalRef.componentInstance.dataRanges = dataRanges;
        if (multivalue != null) modalRef.componentInstance.multivalue = multivalue;
        if (validation != null) modalRef.componentInstance.validate = validation;
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
    newConceptFromLabel(title: TextOrTranslation, xLabel: ARTResource, cls: ARTURIResource, clsChangeable?: boolean, sibling?: ARTURIResource) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewConceptFromLabelModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.xLabel = xLabel;
        modalRef.componentInstance.cls = cls;
        if (clsChangeable != null) modalRef.componentInstance.clsChangeable = clsChangeable;
        if (sibling != null) modalRef.componentInstance.sibling = sibling;
        return modalRef.result;
    }

}