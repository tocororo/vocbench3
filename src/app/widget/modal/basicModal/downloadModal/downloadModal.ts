import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'download-modal',
	templateUrl: './downloadModal.html',
	styleUrls: ['../../modals.css']
})
export class DownloadModal {

	@Input() title: string;
	@Input() message: string;
	@Input() downloadLink: string;
    @Input() fileName: string;
    
    constructor(public activeModal: NgbActiveModal, public sanitizer: DomSanitizer) { }
    
    safeDownloadLink: SafeUrl;

    ngOnInit() {
        this.safeDownloadLink = this.sanitizer.bypassSecurityTrustUrl(this.downloadLink);
    }

	ok() {
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}