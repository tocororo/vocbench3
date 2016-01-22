import {Component, provide, ElementRef, Injector,
    IterableDiffers, KeyValueDiffers, Renderer} from 'angular2/core';

import {Modal} from 'angular2-modal/src/components/angular2-modal/providers/Modal';
import {ModalDialogInstance} from 'angular2-modal/src/components/angular2-modal/models/ModalDialogInstance';
import {ICustomModal, ICustomModalComponent} from 'angular2-modal/src/components/angular2-modal/models/ICustomModal';
import {ModalConfig} from 'angular2-modal/src/components/angular2-modal/models/ModalConfig';

import {YesNoModalContent, YesNoModal} from 'angular2-modal/src/components/angular2-modal/commonModals/yesNoModal';
import {OKOnlyContent, OKOnlyModal} from 'angular2-modal/src/components/angular2-modal/commonModals/okOnlyModal';

export class DialogService {
    
    public lastModalResult: string;
    
    constructor(private modal: Modal, private elementRef: ElementRef,
                private injector: Injector, private _renderer: Renderer) {}
    
    openDialog() {
        let dialog:  Promise<ModalDialogInstance>;
        let component = YesNoModal;
        
        var config = new ModalConfig("sm", false, 27); //size, blocking, key to close dialog
        var modalContent = new YesNoModalContent("Title", "Body text content", false, "Ok", "Close");
        //1st Title of dialog
        //2nd Content (textual)
        //3rd Hide "NO" button (if true there is only a single button, otherwise there are 2 button)
        //4th Label of "yes" button
        //5th Label of "no" button
        
        let bindings = Injector.resolve([
            provide(ICustomModal, {useValue: config}),
            provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
            provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)}),
            provide(Renderer, {useValue: this._renderer})
        ]);

        dialog = this.modal.open(<any>component, bindings, config);


        dialog.then((resultPromise) => {
            return resultPromise.result.then((result) => {
                this.lastModalResult = result;
            }, () => this.lastModalResult = 'Rejected!');
        });
    }
    
    
}

