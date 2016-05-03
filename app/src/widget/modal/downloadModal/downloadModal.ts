import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class DownloadModalContent {
    /**
     * @param title modal title
     * @param message modal message
     * @param downloadLink link to download the attached file
     * @param fileName name of the file to download
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
        public downloadLink: string,
        public fileName: string) {}
}

@Component({
    selector: "download-modal",
    templateUrl: "app/src/widget/modal/downloadModal/downloadModal.html",
})
export class DownloadModal implements ICustomModalComponent {
    dialog: ModalDialogInstance;
    context: DownloadModalContent;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <DownloadModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        this.dialog.close(true);
    }

}