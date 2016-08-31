import {NgModule}            from '@angular/core';
import {CommonModule}        from '@angular/common';
import {FormsModule}         from '@angular/forms';

import {FilePickerComponent}    from './filePicker/filePickerComponent';
import {LangPickerComponent}    from './langPicker/langPickerComponent';
import {RdfResourceComponent}    from './rdfResource/rdfResourceComponent';

import {SanitizerDirective} from "./directives/sanitizerDirective";

@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [FilePickerComponent, RdfResourceComponent, LangPickerComponent, SanitizerDirective],
    exports: [
        FilePickerComponent,
        RdfResourceComponent,
        SanitizerDirective, 
        LangPickerComponent
    ]
})
export class SharedModule { }