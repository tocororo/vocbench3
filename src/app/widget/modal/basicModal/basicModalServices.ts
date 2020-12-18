import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CustomForm } from 'src/app/models/CustomForms';
import { Cookie } from 'src/app/utils/Cookie';
import { VBContext } from 'src/app/utils/VBContext';
import { ModalOptions, ModalType, TextOrTranslation } from '../Modals';
import { AlertModal } from "./alertModal/alertModal";
import { ConfirmCheckModal, ConfirmCheckOptions } from './confirmModal/confirmCheckModal';
import { ConfirmModal } from './confirmModal/confirmModal';
import { DownloadModal } from './downloadModal/downloadModal';
import { FilePickerModal } from './filePickerModal/filePickerModal';
import { PromptModal } from './promptModal/promptModal';
import { PromptPrefixedModal } from './promptModal/promptPrefixedModal';
import { PromptPropertiesModal } from './promptModal/promptPropertiesModal';
import { CustomFormSelectionModal } from './selectionModal/customFormSelectionModal';
import { SelectionModal, SelectionOption } from './selectionModal/selectionModal';

@Injectable()
export class BasicModalServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    /**
     * Opens a modal with an input text and two buttons (Ok and Cancel) with the given title and content message.
     * Returns a Promise with the result.
     * @param title the title of the modal dialog
     * @param label the label of the input field and optionally a tooltip to show next to it
     * @param msg the message to show over the input field (optional)
     * @param value the value inserted by default in the input field
     * @param inputOptional tells if the input field is optional or mandatory (default false)
     * @param inputSanitized tells if the text in the input field should be sanitized (default false)
     * @return if the modal closes with ok returns a promise containing the input text
     */
    prompt(title: TextOrTranslation, label?: { value: string, tooltip?: string }, msg?: TextOrTranslation, value?: string, inputOptional?: boolean, inputSanitized?: boolean) {
        const modalRef: NgbModalRef = this.modalService.open(PromptModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (label != null) modalRef.componentInstance.label = label;
        if (msg != null) {
            modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        }
        if (value != null) modalRef.componentInstance.value = value;
        if (inputOptional != null) modalRef.componentInstance.inputOptional = inputOptional;
        if (inputSanitized != null) modalRef.componentInstance.inputSanitized = inputSanitized;
        return modalRef.result;
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
     * @param prefixEditable tells if the prefix (namespace) in the input field can be edited
     * @return if the modal closes with ok returns a promise containing the input text
     */
    promptPrefixed(title: TextOrTranslation, prefix: string, label?: string, value?: string, inputOptional?: boolean, inputSanitized?: boolean, prefixEditable?: boolean) {
        const modalRef: NgbModalRef = this.modalService.open(PromptPrefixedModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.prefix = prefix;
        if (label != null) modalRef.componentInstance.label = label;
        if (value != null) modalRef.componentInstance.value = value;
        if (inputOptional != null) modalRef.componentInstance.inputOptional = inputOptional;
        if (inputSanitized != null) modalRef.componentInstance.inputSanitized = inputSanitized;
        if (prefixEditable != null) modalRef.componentInstance.prefixEditable = prefixEditable;
        return modalRef.result;
    }

    /**
     * Opens a modal that allows to provide a set of properties values.
     * @param title 
     * @param properties 
     * @param allowEmpty
     */
    promptProperties(title: TextOrTranslation, properties: { [key: string]: string }, allowEmpty: boolean) {
        const modalRef: NgbModalRef = this.modalService.open(PromptPropertiesModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.properties = properties;
        modalRef.componentInstance.allowEmpty = allowEmpty;
        return modalRef.result;
    }

    /**
     * Opens a modal with two buttons (Yes and No) with the given title and content message.
     * Returns a Promise with the result
     * @param title the title of the modal dialog
     * @param msg the message to show in the modal dialog body
     * @param type tells the type of the dialog. Determines the style of the message in the dialog.
     * Available values: info (default), error, warning
     * @return if the modal closes with ok returns a promise containing a boolean true
     */
    confirm(title: TextOrTranslation, msg: TextOrTranslation, type?: ModalType) {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(ConfirmModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        if (type != null) modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    /**
     * Opens a modal with two buttons (Yes and No) with a checkbox and the given title and content message.
     * Returns a Promise with the checkbox status
     * @param title the title of the modal dialog
     * @param msg the message to show in the modal dialog body
     * @param checkOpts options for customizing the checkbox
     * @param type tells the type of the dialog. Determines the style of the message in the dialog.
     * Available values: info (default), error, warning
     */
    confirmCheck(title: TextOrTranslation, msg: TextOrTranslation, checkOpts: ConfirmCheckOptions[], type?: ModalType): Promise<ConfirmCheckOptions[]> {
        const modalRef: NgbModalRef = this.modalService.open(ConfirmCheckModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        modalRef.componentInstance.checkOpts = checkOpts;
        if (type != null) modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    /**
     * Opens a modal with an info message and a single button to dismiss the modal.
     * @param title the title of the modal dialog
     * @param msg the message to show in the modal dialog body
     * @param type tells the type of the dialog. Determines the style of the message in the dialog.
     * Available values: info (default), error, warning
     * @param checkboxLabel if provided, the alert will contain a checkbox with the given label
     * @param details details showed in a expandable/collapsable panel
     */
    alert(title: TextOrTranslation, msg: TextOrTranslation, type?: ModalType, details?: string, checkboxLabel?: string): Promise<boolean> {
        const modalRef: NgbModalRef = this.modalService.open(AlertModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        if (type != null) modalRef.componentInstance.type = type;
        if (details != null) modalRef.componentInstance.details = details;
        if (checkboxLabel != null) modalRef.componentInstance.checkboxLabel = checkboxLabel;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param msg 
     * @param warningCookie 
     */
    alertCheckCookie(title: TextOrTranslation, msg: TextOrTranslation, warningCookie: string, type?: ModalType) {
        return this.alert(title, msg, type, null, "Don't show this again").then(
            confirm => {
                if (confirm) {
                    Cookie.setCookie(warningCookie, "false", 365*10, VBContext.getLoggedUser().getIri());
                }
            }
        );
    }

    /**
     * Opens a modal with an message and a list of selectable options.
     * @param title the title of the modal dialog
     * @param msg the message to show in the modal dialog body. If null no message will be in the modal
     * @param options array of options. This can be an array of string or an array of objects 
     * {value: string, description: string}, where the description is shown on mouseover of the option value
     * @return if the modal closes with ok returns a promise containing the selected option
     */
    select(title: TextOrTranslation, msg: TextOrTranslation, options: Array<string|SelectionOption>, type?: ModalType) {
        const modalRef: NgbModalRef = this.modalService.open(SelectionModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        modalRef.componentInstance.options = options;
        if (type != null) modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    /**
     * Opens a modal with a link to download a file
     * @param title the title of the modal dialog
     * @param msg the message to show in the modal dialog body. If null no message will be in the modal
     * @param downloadLink link for download
     * @param fileName name of the file to download
     */
    downloadLink(title: TextOrTranslation, msg: TextOrTranslation, downloadLink: string, fileName: string) {
        const modalRef: NgbModalRef = this.modalService.open(DownloadModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        modalRef.componentInstance.downloadLink = downloadLink;
        modalRef.componentInstance.fileName = fileName;
        return modalRef.result;
    }

    /**
     * Opens a modal with a link to download a file
     * @param title the title of the modal dialog
     * @param msg the message to show in the modal dialog body. If null no message will be in the modal
     * @param downloadLink link for download
     * @param fileName name of the file to download
     */
    selectFile(title: TextOrTranslation, msg?: TextOrTranslation, accept?: string) {
        const modalRef: NgbModalRef = this.modalService.open(FilePickerModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (msg != null) {
            modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        }
        if (accept != null) modalRef.componentInstance.accept = accept;
        return modalRef.result;
    }

    /**
     * Opens a modal for selecting a CustomForm to use.
     * @param title the title of the modal dialog
     * @param cfList list of custom forms
     * @param hideNo tells if the no button should be hide
     * @return a promise containing the selected CF
     */
    selectCustomForm(title: TextOrTranslation, cfList: CustomForm[], hideNo?: boolean) {
        const modalRef: NgbModalRef = this.modalService.open(CustomFormSelectionModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.cfList = cfList;
        if (hideNo != null) modalRef.componentInstance.hideNo = hideNo;
        return modalRef.result;
    }

}