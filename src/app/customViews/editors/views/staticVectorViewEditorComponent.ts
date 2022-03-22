import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomViewModel } from 'src/app/models/CustomViews';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { AbstractPropertiesBasedViewEditor } from './abstractPropertiesBasedViewEditor';

@Component({
    selector: 'static-vector-view-editor',
    templateUrl: "propertiesBasedViewEditor.html",
})
export class StaticVectorViewEditorComponent extends AbstractPropertiesBasedViewEditor {

    model: CustomViewModel = CustomViewModel.static_vector;

    propertyListLabel: string = "Headers";
    invalidPropListMsg: string = "Headers list must contain at least one proprety.";
    allowDuplicates: boolean = false;

    infoHtml: string = `This view can be used to represent tabular data in ResourceView.
    Each row of the table represents the description of a value of the triggering property.
    The values represented in the cells are determined by the list of properties which will be used also as table headers.`;

    constructor(basicModals: BasicModalServices, sanitizer: DomSanitizer) {
        super(basicModals, sanitizer);
    }

    ngOnInit() {
        super.ngOnInit();
    }

}
