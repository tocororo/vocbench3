import { Component } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";

export class DownloadModalData extends BSModalContext {
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
        public fileName: string
    ) {
        super();
    }
}

@Component({
    selector: "download-modal",
    templateUrl: "./downloadModal.html",
})
export class DownloadModal implements ModalComponent<DownloadModalData> {
    context: DownloadModalData;

    private safeDownloadLink: SafeUrl;

    constructor(public dialog: DialogRef<DownloadModalData>, public sanitizer: DomSanitizer) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.safeDownloadLink = this.sanitizer.bypassSecurityTrustUrl(this.context.downloadLink);
    }

    ok(event: Event) {
        this.dialog.close(true);
    }

}