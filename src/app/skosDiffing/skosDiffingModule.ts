import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../modules/sharedModule';
import { CreateDiffingTaskModal } from './modals/createDiffingTaskModal';
import { SkosDiffingComponent } from './skosDiffingComponent';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        CreateDiffingTaskModal,
        SkosDiffingComponent,
    ],
    exports: [SkosDiffingComponent],
    providers: [],
    entryComponents: [
        CreateDiffingTaskModal
    ]
})
export class SkosDiffingModule { }