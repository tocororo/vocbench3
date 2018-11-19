import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTLiteral, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { LanguageConstraint } from '../../../models/LanguagesCountries';
import { NewPlainLiteralModal, NewPlainLiteralModalData } from "./newPlainLiteralModal/newPlainLiteralModal";
import { NewLexiconCfModal, NewLexiconCfModalData } from './newResourceModal/ontolex/newLexiconCfModal';
import { NewOntoLexicalizationCfModal, NewOntoLexicalizationCfModalData } from './newResourceModal/ontolex/newOntoLexicalizationCfModal';
import { NewResourceCfModal, NewResourceCfModalData } from "./newResourceModal/shared/newResourceCfModal";
import { NewResourceWithLiteralCfModal, NewResourceWithLiteralCfModalData } from './newResourceModal/shared/newResourceWithLiteralCfModal';
import { NewConceptCfModal, NewConceptCfModalData } from "./newResourceModal/skos/newConceptCfModal";
import { NewConceptFromLabelModal, NewConceptFromLabelModalData } from "./newResourceModal/skos/newConceptFromLabelModal";
import { NewXLabelModal, NewXLabelModalData } from './newResourceModal/skos/newXLabelModal';
import { NewTypedLiteralModal, NewTypedLiteralModalData } from "./newTypedLiteralModal/newTypedLiteralModal";

@Injectable()
export class CreationModalServices {

    constructor(private modal: Modal) { }

    /**
     * Opens a modal to create a new resource with uri plus custom form supplement fields
     * @param title the title of the modal dialog
     * @param cls class of the new creating resource
     * @param clsChangeable tells if the class of the creating resource can be changed
     * @param cfId the custom form id
     * @return
     */
    newResourceCf(title: string, cls: ARTURIResource, clsChangeable?: boolean) {
        var modalData = new NewResourceCfModalData(title, cls, clsChangeable);
        const builder = new BSModalContextBuilder<NewResourceCfModalData>(
            modalData, undefined, NewResourceCfModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewResourceCfModal, overlayConfig).result;
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
        var modalData = new NewResourceWithLiteralCfModalData(title, cls, clsChangeable, literalLabel, lang, langConstraints);
        const builder = new BSModalContextBuilder<NewResourceWithLiteralCfModalData>(
            modalData, undefined, NewResourceWithLiteralCfModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewResourceWithLiteralCfModal, overlayConfig).result;
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
        var modalData = new NewConceptCfModalData(title, broader, schemes, cls, clsChangeable, lang);
        const builder = new BSModalContextBuilder<NewConceptCfModalData>(
            modalData, undefined, NewConceptCfModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewConceptCfModal, overlayConfig).result;
    }

    /**
     * Opens a modal to create a new ontolex lexicon
     * @param title 
     * @param clsChangeable 
     */
    newLexiconCf(title: string, clsChangeable?: boolean) {
        var modalData = new NewLexiconCfModalData(title, clsChangeable);
        const builder = new BSModalContextBuilder<NewLexiconCfModalData>(
            modalData, undefined, NewLexiconCfModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewLexiconCfModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     * @param lexicalizationProp determines which type of lexicalization should create
     *  (OntoLex.senses | OntoLex.denotes | Ontolex.isDenotedBy)
     * @param clsChangeable 
     */
    newOntoLexicalizationCf(title: string, lexicalizationProp: ARTURIResource, clsChangeable?: boolean) {
        var modalData = new NewOntoLexicalizationCfModalData(title, lexicalizationProp, clsChangeable);
        const builder = new BSModalContextBuilder<NewOntoLexicalizationCfModalData>(
            modalData, undefined, NewOntoLexicalizationCfModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewOntoLexicalizationCfModal, overlayConfig).result;
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
        var modalData = new NewXLabelModalData(title, value, valueReadonly, lang, langReadonly, clsChangeable, multivalueOpt);
        const builder = new BSModalContextBuilder<NewXLabelModalData>(
            modalData, undefined, NewXLabelModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewXLabelModal, overlayConfig).result;
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
        var modalData = new NewPlainLiteralModalData(title, value, valueReadonly, lang, langReadonly, langConstraints, multivalueOpt);
        const builder = new BSModalContextBuilder<NewPlainLiteralModalData>(
            modalData, undefined, NewPlainLiteralModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewPlainLiteralModal, overlayConfig).result;
    }

    /**
     * Opens a modal to create a new literal with datatype
     * @param title the title of the modal dialog
     * @param allowedDatatypes datatypes allowed in the datatype selection list
     * @return if the modal closes with ok returns a promise containing an ARTLiteral
     */
    newTypedLiteral(title: string, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[]) {
        var modalData = new NewTypedLiteralModalData(title, allowedDatatypes, dataRanges);
        const builder = new BSModalContextBuilder<NewTypedLiteralModalData>(
            modalData, undefined, NewTypedLiteralModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewTypedLiteralModal, overlayConfig).result;
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
        var modalData = new NewConceptFromLabelModalData(title, xLabel, cls, clsChangeable, sibling);
        const builder = new BSModalContextBuilder<NewConceptFromLabelModalData>(
            modalData, undefined, NewConceptFromLabelModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewConceptFromLabelModal, overlayConfig).result;
    }

}