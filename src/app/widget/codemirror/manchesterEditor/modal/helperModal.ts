import { DialogRef } from 'ngx-modialog';
import { Component } from '@angular/core';

@Component({
    selector: 'helper-modal',
    templateUrl: "helperModal.html"
})

export class HelperModal{
    constructor(public dialog: DialogRef<Text>) {
    
    }

    

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}