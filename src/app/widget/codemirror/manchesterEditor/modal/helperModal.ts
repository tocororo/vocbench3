import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'helper-modal',
    templateUrl: "helperModal.html",
    styleUrls: ["./helperModal.css"]
})

export class HelperModal {

    constructor(public activeModal: NgbActiveModal) {}

    ok() {
        this.activeModal.close();
    }

}