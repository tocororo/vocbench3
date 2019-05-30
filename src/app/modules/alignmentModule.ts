import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlignFromGenomaComponent } from '../alignment/alignmentValidationNew/alignFromGenomaComponent';
import { CreateAlignmentModal } from '../alignment/alignmentMaintenance/createAlignmentModal';
import { SharedModule } from './sharedModule';
import { AlignmentValidationComponentNew } from '../alignment/alignmentValidationNew/alignmentValidationComponentNew';
import { AlignFromFileComponent } from '../alignment/alignmentValidationNew/alignFromFileComponent';
import { AlignmentManagementComponent } from '../alignment/alignmentValidationNew/alignmentManagementComponent';




@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        AlignmentValidationComponentNew,
        AlignFromGenomaComponent,
        AlignFromFileComponent,
        AlignmentManagementComponent,
        //modals
        CreateAlignmentModal
    ],
    exports: [AlignFromGenomaComponent],
    providers: [],
    entryComponents: [
        CreateAlignmentModal
    ]
})
export class AlignmentModule { }