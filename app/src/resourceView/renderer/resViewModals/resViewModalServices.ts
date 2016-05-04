import {Injectable, ReflectiveInjector, provide} from '@angular/core';
import {Modal, ModalConfig, ModalDialogInstance, ICustomModal} from 'angular2-modal/angular2-modal';
import {ClassListCreatorModal, ClassListCreatorModalContent} from "./classListCreatorModal";
import {InstanceListCreatorModal, InstanceListCreatorModalContent} from "./instanceListCreatorModal";
import {EnrichPropertyModal, EnrichPropertyModalContent} from "./enrichPropertyModal";
import {ARTURIResource} from '../../../utils/ARTResources';

/**
 * Service to open modals that allow to create a classes list or instances list
 */
@Injectable()
export class ResViewModalServices {
    
    constructor(private modal: Modal) {}
    
    /**
     * Opens a modal to create a list of classes (useful for class axioms)
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing an array of 
     * classes (ARTURIResource) and expressions (ARTBNode)
     */
    createClassList(title: string) {
        var modalContent = new ClassListCreatorModalContent(title);
        let resolvedBindings = ReflectiveInjector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>ClassListCreatorModal,
                resolvedBindings,
                new ModalConfig('lg', true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to create a list of instance (useful for class axioms)
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing an array of instances
     */
    createInstanceList(title: string) {
        var modalContent = new InstanceListCreatorModalContent(title);
        let resolvedBindings = ReflectiveInjector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>InstanceListCreatorModal,
                resolvedBindings,
                new ModalConfig('lg', true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to select a resource to set as value of a property with range "resource"
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected resource
     */
    enrichProperty(title: string, property: ARTURIResource, ranges: ARTURIResource[]) {
        var modalContent = new EnrichPropertyModalContent(title, property, ranges);
        let resolvedBindings = ReflectiveInjector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>EnrichPropertyModal,
                resolvedBindings,
                new ModalConfig('lg', true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
}