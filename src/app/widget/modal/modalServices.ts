import {Injectable} from '@angular/core';
import {Modal, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {OverlayConfig} from 'angular2-modal';
import {ARTNode, ARTURIResource} from "../../models/ARTResources";
import {PromptModal, PromptModalData} from "./promptModal/promptModal";
import {PromptPrefixedModal, PromptPrefixedModalData} from "./promptModal/promptPrefixedModal";
import {ConfirmModal, ConfirmModalData} from "./confirmModal/confirmModal";
import {ConfirmCheckModal, ConfirmCheckModalData} from "./confirmModal/confirmCheckModal";
import {AlertModal, AlertModalData} from "./alertModal/alertModal";
import {DownloadModal, DownloadModalData} from "./downloadModal/downloadModal";
import {FilePickerModal, FilePickerModalData} from "./filePickerModal/filePickerModal";
import {NewResourceModal, NewResourceModalData} from "./newResourceModal/newResourceModal";
import {NewPlainLiteralModal, NewPlainLiteralModalData} from "./newPlainLiteralModal/newPlainLiteralModal";
import {NewTypedLiteralModal, NewTypedLiteralModalData} from "./newTypedLiteralModal/newTypedLiteralModal";
import {SelectionModal, SelectionModalData} from "./selectionModal/selectionModal";
import {ResourceSelectionModal, ResourceSelectionModalData} from "./selectionModal/resourceSelectionModal";
import {ContentLangModal} from "./contentLangModal/contentLangModal";

export type ModalType = "info" | "error" | "warning";

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
        var modalData = new PromptModalData(title, label, value, false, inputOptional, inputSanitized);
        const builder = new BSModalContextBuilder<PromptModalData>(
            modalData, undefined, PromptModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(PromptModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    /**
     * Opens a modal with an input text and two buttons (Ok and Cancel) with the given title and content message.
     * Returns a Promise with the result.
     * @param title the title of the modal dialog
     * @param prefix the prefix to show on the left of the input field
     * @param label the label of the input field (optional)
     * @param value the value inserted by default in the input field
     * @param inputOptional tells if the input field is optional or mandatory
     * @param inputSanitized tells if the text in the input field should be sanitized
     * @return if the modal closes with ok returns a promise containing the input text
     */
    promptPrefixed(title: string, prefix: string, label?: string, value?: string, inputOptional?: boolean, inputSanitized?: boolean) {
        var modalData = new PromptPrefixedModalData(title, prefix, label, value, false, inputOptional, inputSanitized);
        const builder = new BSModalContextBuilder<PromptPrefixedModalData>(
            modalData, undefined, PromptPrefixedModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(PromptPrefixedModal, overlayConfig).then(
            dialog => dialog.result
        );
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
        var modalData = new ConfirmModalData(title, message, modalType);
        const builder = new BSModalContextBuilder<ConfirmModalData>(
            modalData, undefined, ConfirmModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ConfirmModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
    /**
     * Opens a modal with two buttons (Yes and No) with the given title and content message.
     * Returns a Promise with the result
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body
     * @param checkboxLabel the label of the checkbox in the modal body
     * @param type tells the type of the dialog. Determines the style of the message in the dialog.
     * Available values: info, error, warning (default)
     * @return if the modal closes with ok returns a promise containing a boolean with the value of the checkbox
     */
    confirmCheck(title: string, message: string, checkboxLabel: string, type?: ModalType) {
        var modalType = type ? type : "warning"; //set default type to warning if not defined
        var modalData = new ConfirmCheckModalData(title, message, checkboxLabel, modalType);
        const builder = new BSModalContextBuilder<ConfirmCheckModalData>(
            modalData, undefined, ConfirmCheckModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ConfirmCheckModal, overlayConfig).then(
            dialog => dialog.result
        );
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
        var modalData = new AlertModalData(title, message, modalType);
        const builder = new BSModalContextBuilder<AlertModalData>(
            modalData, undefined, AlertModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(AlertModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    /**
     * Opens a modal with an message and a list of selectable options.
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param options array of options. This can be an array of string or an array of objects 
     * {value: string, description: string}, where the description is shown on mouseover of the option value
     * @param optionsWithDescription if true the options array is treated as an array of objects,
     * otherwise it is a simple string array 
     * @return if the modal closes with ok returns a promise containing the selected option
     */
    select(title: string, message: string, options: Array<any>, optionsWithDescription?: boolean) {
        var modalData = new SelectionModalData(title, message, options, optionsWithDescription);
        const builder = new BSModalContextBuilder<SelectionModalData>(
            modalData, undefined, SelectionModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(SelectionModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
    /**
     * Opens a modal with a link to download a file
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param downloadLink link for download
     * @param fileName name of the file to download
     */
    downloadLink(title: string, message: string, downloadLink: string, fileName: string) {
        var modalData = new DownloadModalData(title, message, downloadLink, fileName);
        const builder = new BSModalContextBuilder<DownloadModalData>(
            modalData, undefined, DownloadModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(DownloadModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    /**
     * Opens a modal with a link to download a file
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param downloadLink link for download
     * @param fileName name of the file to download
     * @param placeholder text to show in the filepicker when no file is selected
     */
    selectFile(title: string, message?: string, label?: string, placeholder?: string, accept?: string) {
        var modalData = new FilePickerModalData(title, message, label, placeholder, accept);
        const builder = new BSModalContextBuilder<FilePickerModalData>(
            modalData, undefined, FilePickerModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(FilePickerModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
    /**
     * Opens a modal with an message and a list of selectable options.
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param resourceList array of available resources
     * @return if the modal closes with ok returns a promise containing the selected resource
     */
    selectResource(title: string, message: string, resourceList: Array<ARTNode>) {
        var modalData = new ResourceSelectionModalData(title, message, resourceList);
        const builder = new BSModalContextBuilder<ResourceSelectionModalData>(
            modalData, undefined, ResourceSelectionModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ResourceSelectionModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
    /**
     * Opens a modal to create a new resource with name, label and language tag
     * @param title the title of the modal dialog
     * @param lang the language of the new resource
     * @return if the modal closes with ok returns a promise containing an object with name, label and lang
     */
    newResource(title: string, lang?: string) {
        var modalData = new NewResourceModalData(title, lang);
        const builder = new BSModalContextBuilder<NewResourceModalData>(
            modalData, undefined, NewResourceModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(NewResourceModal, overlayConfig).then(
            dialog => dialog.result
        );
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
        var modalData = new NewPlainLiteralModalData(title, value, valueReadonly, lang, langReadonly);
        const builder = new BSModalContextBuilder<NewPlainLiteralModalData>(
            modalData, undefined, NewPlainLiteralModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(NewPlainLiteralModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
    /**
     * Opens a modal to create a new literal with datatype
     * @param title the title of the modal dialog
     * @param allowedDatatypes datatypes allowed in the datatype selection list
     * @return if the modal closes with ok returns a promise containing an object with value and datatype
     */
    newTypedLiteral(title: string, allowedDatatypes?: string[]) {
        var modalData = new NewTypedLiteralModalData(title, allowedDatatypes);
        const builder = new BSModalContextBuilder<NewTypedLiteralModalData>(
            modalData, undefined, NewTypedLiteralModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(NewTypedLiteralModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    /**
     * Opens a modal to change the content language.
     * @return
     */
    changeContentLang() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ContentLangModal, overlayConfig).then(
            dialog => dialog.result
        );
    }
    
}