import {Injectable} from '@angular/core';
import {Modal, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {OverlayConfig} from 'angular2-modal';
import {ClassTreeModal, ClassTreeModalData} from "../browsingModal/classTreeModal/classTreeModal";
import {InstanceListModal, InstanceListModalData} from "../browsingModal/instanceListModal/instanceListModal";
import {ConceptTreeModal, ConceptTreeModalData} from "../browsingModal/conceptTreeModal/conceptTreeModal";
import {SchemeListModal, SchemeListModalData} from "../browsingModal/schemeListModal/schemeListModal";
import {PropertyTreeModal, PropertyTreeModalData} from "../browsingModal/propertyTreeModal/propertyTreeModal";
import {ARTURIResource} from "../../../utils/ARTResources";

/**
 * Service to open browsing modals, namely the modal that contains trees (concept, class, property) or list (instances).
 * I cannot use the existing modalService because the tree Compoenents inside the browsingModals already opens modals in case of
 * excpetions, so they have already injected modalService. So, modalService would crates a CustomModal that 
 * needs a tree Component injected, and the tree Compoenent in turn needs modalService injected creating a injection cycle
 * modalService -> CustomModal -> treeComponent -> modalService
 */
@Injectable()
export class BrowsingServices {
    
    constructor(private modal: Modal) {}
    
    /**
     * Opens a modal to browse the class tree
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected class
     */
    browseClassTree(title: string) {
        var modalData = new ClassTreeModalData(title);
        const builder = new BSModalContextBuilder<ClassTreeModalData>(
            modalData, undefined, ClassTreeModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ClassTreeModal, overlayConfig).then(
            dialog => dialog.result
        );
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
        return this.modal.open(InstanceListModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param scheme the scheme of the concept tree. If not provided the modal contains a tree in no-scheme mode
     * @param schemeChangeable if true a menu is shown and the user can browse not only the selected scheme
     * @return if the modal closes with ok returns a promise containing the selected concept
     */
    browseConceptTree(title: string, scheme?: ARTURIResource, schemeChangeable?: boolean) {
        var modalData = new ConceptTreeModalData(title, scheme, schemeChangeable);
        const builder = new BSModalContextBuilder<ConceptTreeModalData>(
            modalData, undefined, ConceptTreeModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ConceptTreeModal, overlayConfig).then(
            dialog => dialog.result
        );
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
        return this.modal.open(SchemeListModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
    /**
     * Opens a modal to browse the property tree
     * @param title the title of the modal
     * @param resource optional, if provided the returned propertyTree contains 
     * just the properties that have as domain the type of the resource 
     * @return if the modal closes with ok returns a promise containing the selected property
     */
    browsePropertyTree(title: string, resource?: ARTURIResource) {
        var modalData = new PropertyTreeModalData(title, resource);
        const builder = new BSModalContextBuilder<PropertyTreeModalData>(
            modalData, undefined, PropertyTreeModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(PropertyTreeModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
}