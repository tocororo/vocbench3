import {Injectable, Injector, provide} from 'angular2/core';
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
        let dialog: Promise<ModalDialogInstance>;
        let component = ClassListCreatorModal;
        
        //inject the modal content in the modal Component
        var modalContent = new ClassListCreatorModalContent(title);
        let bindings = Injector.resolve([provide(ICustomModal, {useValue: modalContent})]);
        
        //set the modal configuration (large dimension, blocking and without key to dismiss)
        var modConf = new ModalConfig("lg", true, null);
        
        dialog = this.modal.open(<any>component, bindings, modConf);
        return dialog.then(
            resultPromise => {
                return resultPromise.result;
            }
        );
    }
    
    /**
     * Opens a modal to create a list of instance (useful for class axioms)
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing an array of instances
     */
    createInstanceList(title: string) {
        let dialog: Promise<ModalDialogInstance>;
        let component = InstanceListCreatorModal;
        
        //inject the modal content in the modal Component
        var modalContent = new InstanceListCreatorModalContent(title);
        let bindings = Injector.resolve([provide(ICustomModal, {useValue: modalContent})]);
        
        //set the modal configuration (large dimension, blocking and without key to dismiss)
        var modConf = new ModalConfig("lg", true, null);
        
        dialog = this.modal.open(<any>component, bindings, modConf);
        return dialog.then(
            resultPromise => {
                return resultPromise.result;
            }
        );
    }
    
    /**
     * Opens a modal to select a resource to set as value of a property with range "resource"
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected resource
     */
    enrichProperty(title: string, property: ARTURIResource, ranges: ARTURIResource[]) {
        let dialog: Promise<ModalDialogInstance>;
        let component = EnrichPropertyModal;
        
        //inject the modal content in the modal Component
        var modalContent = new EnrichPropertyModalContent(title, property, ranges);
        let bindings = Injector.resolve([provide(ICustomModal, {useValue: modalContent})]);
        
        //set the modal configuration (large dimension, blocking and without key to dismiss)
        var modConf = new ModalConfig("lg", true, null);
        
        dialog = this.modal.open(<any>component, bindings, modConf);
        return dialog.then(
            resultPromise => {
                return resultPromise.result;
            }
        );
    }
    
}