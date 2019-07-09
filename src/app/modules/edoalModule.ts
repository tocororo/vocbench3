import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EdoalComponent } from '../edoal/edoalComponent';
import { SharedModule } from './sharedModule';
import { TreeAndListModule } from './treeAndListModule';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TreeAndListModule
    ],
    declarations: [
        EdoalComponent
    ],
    exports: [],
    providers: [],
    entryComponents: []
})
export class EdoalModule { }