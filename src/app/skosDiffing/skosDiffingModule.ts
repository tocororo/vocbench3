import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../modules/sharedModule';
import { SkosDiffingComponent } from './skosDiffingComponent';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        SkosDiffingComponent
    ],
    exports: [SkosDiffingComponent],
    providers: [],
    entryComponents: []
})
export class SkosDiffingModule { }