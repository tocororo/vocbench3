import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangeMeasureModal } from '../edoal/changeMeasureModal';
import { EdoalComponent } from '../edoal/edoalComponent';
import { SharedModule } from './sharedModule';
import { TreeAndListModule } from './treeAndListModule';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
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