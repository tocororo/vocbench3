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
        let dialog: Promise<ModalDialogInstance>;
        let component = ClassTreeModal;
        
        //inject the modal content in the modal Component
        var modalContent = new ClassTreeModalContent(title);
        let bindings = Injector.resolve([provide(ICustomModal, {useValue: modalContent})]);
        
        //set the modal configuration (medium dimension, blocking and without key to dismiss)
        var modConf = new ModalConfig("md", true, null);
        
        dialog = this.modal.open(<any>component, bindings, modConf);
        return dialog.then(
            resultPromise => {
                return resultPromise.result;
            }
        );
    }
    
    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param cls the class of the instance to browse
     * @return if the modal closes with ok returns a promise containing the selected instance
     */
    browseInstanceList(title: string, cls: ARTURIResource) {
        let dialog: Promise<ModalDialogInstance>;
        let component = InstanceListModal;
        
        //inject the modal content in the modal Component
        var modalContent = new InstanceListModalContent(title, cls);
        let bindings = Injector.resolve([provide(ICustomModal, {useValue: modalContent})]);
        
        //set the modal configuration (medium dimension, blocking and without key to dismiss)
        var modConf = new ModalConfig("md", true, null);
        
        dialog = this.modal.open(<any>component, bindings, modConf);
        return dialog.then(
            resultPromise => {
                return resultPromise.result;
            }
        );
    }
    
    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param scheme the scheme of the concept tree. If not provided the modal contains a tree in no-scheme mode
     * @return if the modal closes with ok returns a promise containing the selected concept
     */
    browseConceptTree(title: string, scheme?: ARTURIResource) {
        let dialog: Promise<ModalDialogInstance>;
        let component = ConceptTreeModal;
        
        //inject the modal content in the modal Component
        var modalContent = new ConceptTreeModalContent(title, scheme);
        let bindings = Injector.resolve([provide(ICustomModal, {useValue: modalContent})]);
        
        //set the modal configuration (medium dimension, blocking and without key to dismiss)
        var modConf = new ModalConfig("md", true, null);
        
        dialog = this.modal.open(<any>component, bindings, modConf);
        return dialog.then(
            resultPromise => {
                return resultPromise.result;
            }
        );
    }
    
    /**
     * Opens a modal to browse the scheme list
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected scheme
     */
    browseSchemeList(title: string) {
        let dialog: Promise<ModalDialogInstance>;
        let component = SchemeListModal;
        
        //inject the modal content in the modal Component
        var modalContent = new SchemeListModalContent(title);
        let bindings = Injector.resolve([provide(ICustomModal, {useValue: modalContent})]);
        
        //set the modal configuration (medium dimension, blocking and without key to dismiss)
        var modConf = new ModalConfig("md", true, null);
        
        dialog = this.modal.open(<any>component, bindings, modConf);
        return dialog.then(
            resultPromise => {
                return resultPromise.result;
            }
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
        let dialog: Promise<ModalDialogInstance>;
        let component = PropertyTreeModal;
        
        //inject the modal content in the modal Component
        var modalContent = new PropertyTreeModalContent(title, resource);
        let bindings = Injector.resolve([provide(ICustomModal, {useValue: modalContent})]);
        
        //set the modal configuration (medium dimension, blocking and without key to dismiss)
        var modConf = new ModalConfig("md", true, null);
        
        dialog = this.modal.open(<any>component, bindings, modConf);
        return dialog.then(
            resultPromise => {
                return resultPromise.result;
            }
        );
    }
    
}