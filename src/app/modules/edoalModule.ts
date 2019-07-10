import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdoalComponent } from '../edoal/edoalComponent';
import { SharedModule } from './sharedModule';
import { TreeAndListModule } from './treeAndListModule';
import { ChangeMeasureModal } from '../edoal/changeMeasureModal';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        TreeAndListModule
    ],
    declarations: [
        ChangeMeasureModal,
        EdoalComponent,
    ],
    exports: [],
    providers: [],
    entryComponents: [ChangeMeasureModal]
})
export class EdoalModule { }