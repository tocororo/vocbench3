import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../modules/sharedModule';
import { CreateDiffingTaskModal } from './modals/createDiffingTaskModal';
import { SkosDiffingComponent } from './skosDiffingComponent';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        SharedModule,
        TranslateModule
    ],
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