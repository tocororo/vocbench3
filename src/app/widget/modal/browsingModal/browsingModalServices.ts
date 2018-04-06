import { Injectable } from '@angular/core';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { ClassTreeModal, ClassTreeModalData } from "../browsingModal/classTreeModal/classTreeModal";
import { ClassIndividualTreeModal, ClassIndividualTreeModalData } from "../browsingModal/classIndividualTreeModal/classIndividualTreeModal";
import { InstanceListModal, InstanceListModalData } from "../browsingModal/instanceListModal/instanceListModal";
import { ConceptTreeModal, ConceptTreeModalData } from "../browsingModal/conceptTreeModal/conceptTreeModal";
import { CollectionTreeModal, CollectionTreeModalData } from "../browsingModal/collectionTreeModal/collectionTreeModal";
import { SchemeListModal, SchemeListModalData } from "../browsingModal/schemeListModal/schemeListModal";
import { PropertyTreeModal, PropertyTreeModalData } from "../browsingModal/propertyTreeModal/propertyTreeModal";
import { LexicalEntryListModal, LexicalEntryListModalData } from './lexicalEntryListModal/lexicalEntryListModal';
import { LexiconListModal, LexiconListModalData } from './lexiconListModal/lexiconListModal';
import { ARTURIResource } from "../../../models/ARTResources";

/**
 * Service to open browsing modals, namely the modal that contains trees (concept, class, property) or list (instances).
 */
@Injectable()
export class BrowsingModalServices {

    constructor(private modal: Modal) { }

    /**
     * Opens a modal to browse the class tree
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected class
     */
    browseClassTree(title: string, roots?: ARTURIResource[]) {
        var modalData = new ClassTreeModalData(title, roots);
        const builder = new BSModalContextBuilder<ClassTreeModalData>(
            modalData, undefined, ClassTreeModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ClassTreeModal, overlayConfig).result;
    }

    /**
     * Opens a modal to browse the class tree and select an individual of a class
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected individual
     */
    browseClassIndividualTree(title: string) {
        var modalData = new ClassIndividualTreeModalData(title);
        const builder = new BSModalContextBuilder<ClassIndividualTreeModalData>(
            modalData, undefined, ClassIndividualTreeModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size("lg").keyboard(null).toJSON() };
        return this.modal.open(ClassIndividualTreeModal, overlayConfig).result;
    }

    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param cls the class of the instance to browse
     * @return if the modal closes with ok returns a promise containing the selected instance
     */
    browseInstanceList(title: string, cls: ARTURIResource) {
        var modalData = new InstanceListModalData(title, cls);
        const builder = new BSModalContextBuilder<InstanceListModalData>(
            modalData, undefined, InstanceListModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(InstanceListModal, overlayConfig).result;
    }

    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param scheme the scheme of the concept tree. If not provided the modal contains a tree in no-scheme mode
     * @param schemeChangeable if true a menu is shown and the user can browse not only the selected scheme
     * @return if the modal closes with ok returns a promise containing the selected concept
     */
    browseConceptTree(title: string, schemes?: ARTURIResource[], schemeChangeable?: boolean) {
        var modalData = new ConceptTreeModalData(title, schemes, schemeChangeable);
        const builder = new BSModalContextBuilder<ConceptTreeModalData>(
            modalData, undefined, ConceptTreeModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ConceptTreeModal, overlayConfig).result;
    }

    /**
     * Opens a modal to browse the collection tree
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected collection
     */
    browseCollectionTree(title: string) {
        var modalData = new CollectionTreeModalData(title);
        const builder = new BSModalContextBuilder<CollectionTreeModalData>(
            modalData, undefined, CollectionTreeModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(CollectionTreeModal, overlayConfig).result;
    }

    /**
     * Opens a modal to browse the scheme list
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected scheme
     */
    browseSchemeList(title: string) {
        var modalData = new SchemeListModalData(title);
        const builder = new BSModalContextBuilder<SchemeListModalData>(
            modalData, undefined, SchemeListModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(SchemeListModal, overlayConfig).result;
    }

    /**
     * Opens a modal to browse the property tree
     * @param title the title of the modal
     * @param rootProperties optional , if provided the tree is build with these properties as roots
     * @param resource optional, if provided the returned propertyTree contains 
     * just the properties that have as domain the type of the resource 
     * @return if the modal closes with ok returns a promise containing the selected property
     */
    browsePropertyTree(title: string, rootProperties?: ARTURIResource[], resource?: ARTURIResource) {
        var modalData = new PropertyTreeModalData(title, rootProperties, resource);
        const builder = new BSModalContextBuilder<PropertyTreeModalData>(
            modalData, undefined, PropertyTreeModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(PropertyTreeModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     * @param lexicon 
     * @param lexiconChangeable 
     */
    browseLexicalEntryList(title: string, lexicon?: ARTURIResource, lexiconChangeable?: boolean) {
        var modalData = new LexicalEntryListModalData(title, lexicon, lexiconChangeable);
        const builder = new BSModalContextBuilder<LexicalEntryListModalData>(
            modalData, undefined, LexicalEntryListModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(LexicalEntryListModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     */
    browseLexiconList(title: string) {
        var modalData = new LexiconListModalData(title);
        const builder = new BSModalContextBuilder<LexiconListModalData>(
            modalData, undefined, LexiconListModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(LexiconListModal, overlayConfig).result;
    }

}