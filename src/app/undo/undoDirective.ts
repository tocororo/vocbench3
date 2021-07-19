import { Directive, HostListener } from '@angular/core';
import { UndoHandler } from './undoHandler';

@Directive({
    selector: '[undo]'
})
export class UndoDirective {

    constructor(private undoHandler: UndoHandler) {}

    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key == "z") {
            this.undoHandler.handle();
        }
    }

}