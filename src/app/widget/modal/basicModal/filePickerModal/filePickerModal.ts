import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "file-picker-modal",
    templateUrl: "./filePickerModal.html",
})
export class FilePickerModal {

    @Input() title: string;
    @Input() message: string;
    @Input() accept: string;

    pickedFile: File;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() { }

    fileChangeEvent(file: File) {
        this.pickedFile = file;
    }

    ok() {
        this.activeModal.close(this.pickedFile);
    }

    close() {
        this.activeModal.dismiss();
    }

}