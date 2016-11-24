import {Component} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser"
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class FilePickerModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message
     * @param label label to show next to the file picker
     * @param placeholder placeholder attribute of the file picker
     * @param accept accept attribute of the file picker
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
        public label: string,
        public placeholder: string,
        public accept: string
    ) {
        super();
    }
}

@Component({
    selector: "file-picker-modal",
    templateUrl: "./filePickerModal.html",
})
export class FilePickerModal implements ModalComponent<FilePickerModalData> {
    context: FilePickerModalData;
    
    private pickedFile: File;
    
    constructor(public dialog: DialogRef<FilePickerModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {}

    private fileChangeEvent(file: File) {
        this.pickedFile = file;
    }

    ok(event) {
        this.dialog.close(this.pickedFile);
    }

    cancel() {
        this.dialog.dismiss();
    }

}