import { Component } from '@angular/core';
import { CustomViewModel } from 'src/app/models/CustomViews';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';

@Component({
    selector: 'dynamic-vector-view-editor',
    templateUrl: "dynamicVectorViewEditorComponent.html",
})
export class DynamicVectorViewEditorComponent extends AbstractCustomViewEditor {

    model: CustomViewModel = CustomViewModel.static_vector;

    constructor() {
        super()
    }

    ngOnInit() {
        super.ngOnInit();
    }

    initCustomViewDef() {
        //TODO
    };

    initEditor() {
        //TODO
    }

    emitChanges(): void {
        this.changed.emit(this.cvDef); //TODO
    }

    public isDataValid(): boolean {
        return true; //TODO
    }

}
