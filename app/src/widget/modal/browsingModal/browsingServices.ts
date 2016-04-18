import {Injectable, Injector, provide} from 'angular2/core';
import {Modal, ModalConfig, ModalDialogInstance, ICustomModal} from 'angular2-modal/angular2-modal';
import {ClassTreeModal, ClassTreeModalContent} from "../browsingModal/classTreeModal/classTreeModal";
import {InstanceListModal, InstanceListModalContent} from "../browsingModal/instanceListModal/instanceListModal";
import {ConceptTreeModal, ConceptTreeModalContent} from "../browsingModal/conceptTreeModal/conceptTreeModal";
import {SchemeListModal, SchemeListModalContent} from "../browsingModal/schemeListModal/schemeListModal";
import {PropertyTreeModal, PropertyTreeModalContent} from "../browsingModal/propertyTreeModal/propertyTreeModal";
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
        var modalContent = new ClassTreeModalContent(title);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>ClassTreeModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param cls the class of the instance to browse
     * @return if the modal closes with ok returns a promise containing the selected instance
     */
    browseInstanceList(title: string, cls: ARTURIResource) {
        var modalContent = new InstanceListModalContent(title, cls);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>InstanceListModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param scheme the scheme of the concept tree. If not provided the modal contains a tree in no-scheme mode
     * @param schemeChangeable if true a menu is shown and the user can browse not only the selected scheme
     * @return if the modal closes with ok returns a promise containing the selected concept
     */
    browseConceptTree(title: string, scheme?: ARTURIResource, schemeChangeable?: boolean) {
        var modalContent = new ConceptTreeModalContent(title, scheme, schemeChangeable);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>ConceptTreeModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to browse the scheme list
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected scheme
     */
    browseSchemeList(title: string) {
        var modalContent = new SchemeListModalContent(title);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>SchemeListModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to browse the property tree
     * @param title the title of the modal
     * @param resource optional, if provided the returned propertyTree contains 
     * just the properties that have as domain the type of the resource 
     * @return if the modal closes with ok returns a promise containing the selected property
     */
    browsePropertyTree(title: string, resource?: ARTURIResource) {
        var modalContent = new PropertyTreeModalContent(title, resource);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>PropertyTreeModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
}