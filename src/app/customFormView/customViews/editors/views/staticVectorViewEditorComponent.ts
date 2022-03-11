import { Component } from '@angular/core';
import { CustomViewModel } from 'src/app/models/CustomViews';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';

@Component({
    selector: 'static-vector-view-editor',
    templateUrl: "staticVectorViewEditorComponent.html",
})
export class StaticVectorViewEditorComponent extends AbstractCustomViewEditor {

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
