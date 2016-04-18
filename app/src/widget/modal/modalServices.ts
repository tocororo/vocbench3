import {Injectable, Injector, provide} from 'angular2/core';
import {Modal, ModalConfig, ModalDialogInstance, ICustomModal} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from "../../utils/ARTResources";
import {PromptModal, PromptModalContent} from "./promptModal/promptModal";
import {ConfirmModal, ConfirmModalContent} from "./confirmModal/confirmModal";
import {AlertModal, AlertModalContent} from "./alertModal/alertModal";
import {NewResourceModal, NewResourceModalContent} from "./newResourceModal/newResourceModal";
import {NewPlainLiteralModal, NewPlainLiteralModalContent} from "./newPlainLiteralModal/newPlainLiteralModal";
import {NewTypedLiteralModal, NewTypedLiteralModalContent} from "./newTypedLiteralModal/newTypedLiteralModal";
import {SelectionModal, SelectionModalContent} from "./selectionModal/selectionModal";
import {ResourceSelectionModal, ResourceSelectionModalContent} from "./selectionModal/resourceSelectionModal";

type ModalType = "info" | "error" | "warning";

@Injectable()
export class ModalServices {
    
    constructor(private modal: Modal) {}
    
    /**
     * Opens a modal with an input text and two buttons (Ok and Cancel) with the given title and content message.
     * Returns a Promise with the result.
     * @param title the title of the modal dialog
     * @param label the label of the input field (optional)
     * @param value the value inserted by default in the input field
     * @param inputOptional tells if the input field is optional or mandatory
     * @param inputSanitized tells if the text in the input field should be sanitized
     * @return if the modal closes with ok returns a promise containing the input text
     */
    prompt(title: string, label?: string, value?: string, inputOptional?: boolean, inputSanitized?: boolean) {
        var modalContent = new PromptModalContent(title, label, value, false, inputOptional, inputSanitized);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>PromptModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal with two buttons (Yes and No) with the given title and content message.
     * Returns a Promise with the result
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body
     * @param type tells the type of the dialog. Determines the style of the message in the dialog.
     * Available values: info (default), error, warning
     * @return if the modal closes with ok returns a promise containing a boolean true
     */
    confirm(title: string, message: string, type?: ModalType) {
        var modalType = type ? type : "warning"; //set default type to warning if not defined
        var modalContent = new ConfirmModalContent(title, message, modalType);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>ConfirmModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal with an info message and a single button to dismiss the modal.
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body
     * @param type tells the type of the dialog. Determines the style of the message in the dialog.
     * Available values: info (default), error, warning
     */
    alert(title: string, message: string, type?: ModalType) {
        var modalType = type ? type : "info"; //set default type to info if not defined
        var modalContent = new AlertModalContent(title, message, modalType);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>AlertModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal with an message and a list of selectable options.
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param options array of options
     * @return if the modal closes with ok returns a promise containing the selected option
     */
    select(title: string, message: string, options: Array<string>) {
        var modalContent = new SelectionModalContent(title, message, options);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>SelectionModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal with an message and a list of selectable options.
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param resourceList array of available resources
     * @return if the modal closes with ok returns a promise containing the selected resource
     */
    selectResource(title: string, message: string, resourceList: Array<ARTURIResource>) {
        var modalContent = new ResourceSelectionModalContent(title, message, resourceList);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>ResourceSelectionModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to create a new resource with name, label and language tag
     * @param title the title of the modal dialog
     * @return if the modal closes with ok returns a promise containing an object with name, label and lang
     */
    newResource(title: string) {
        var modalContent = new NewResourceModalContent(title);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>NewResourceModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to create a new literal with language tag
     * @param title the title of the modal dialog
     * @param value the value inserted by default
     * @param valueReadonly if true the input field is disable and cannot be changed
     * @param lang the language selected as default
     * @param langReadonly if true the language selection is disable and language cannot be changed
     * @return if the modal closes with ok returns a promise containing an object with value and lang
     */
    newPlainLiteral(title: string, value?: string, valueReadonly?: boolean, lang?: string, langReadonly?: boolean) {
        var modalContent = new NewPlainLiteralModalContent(title, value, valueReadonly, lang, langReadonly);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>NewPlainLiteralModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    /**
     * Opens a modal to create a new literal with datatype
     * @param title the title of the modal dialog
     * @param allowedDatatypes datatypes allowed in the datatype selection list
     * @return if the modal closes with ok returns a promise containing an object with value and datatype
     */
    newTypedLiteral(title: string, allowedDatatypes?: string[]) {
        var modalContent = new NewTypedLiteralModalContent(title, allowedDatatypes);
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>NewTypedLiteralModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
}