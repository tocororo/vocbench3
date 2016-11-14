import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {FilePickerComponent} from '../widget/filePicker/filePickerComponent';
import {LangPickerComponent} from '../widget/langPicker/langPickerComponent';
import {RdfResourceComponent} from '../widget/rdfResource/rdfResourceComponent';
import {SanitizerDirective} from "../widget/directives/sanitizerDirective";
import {CodemirrorComponent} from "../widget/codemirror/codemirrorComponent";
import {InputEditableComponent} from '../widget/inputEditable/inputEditableComponent';

import {YasguiComponent} from '../sparql/yasguiComponent';

@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [
        FilePickerComponent, RdfResourceComponent, LangPickerComponent, SanitizerDirective,
        YasguiComponent, CodemirrorComponent, InputEditableComponent
    ],
    exports: [
        FilePickerComponent, RdfResourceComponent, SanitizerDirective, LangPickerComponent,
        YasguiComponent, CodemirrorComponent, InputEditableComponent
    ],
    providers: []
})
export class SharedModule { }