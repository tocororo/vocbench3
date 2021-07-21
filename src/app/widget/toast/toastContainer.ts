import { Component } from '@angular/core';
import { ToastService } from './toastService';



@Component({
    selector: 'app-toasts',
    templateUrl: "toastContainer.html",
    host: { '[class.ngb-toasts]': 'true' },
    styles: [`
        :host {
            position: fixed;
            top: auto !important;
            bottom: 0 !important;
        }
    `]

})
export class ToastsContainer {

    constructor(public toastService: ToastService) { }

}