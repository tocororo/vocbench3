import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlignFromFileComponent } from '../alignment/alignmentValidation/alignFromFileComponent';
import { AlignFromGenomaComponent } from '../alignment/alignmentValidation/alignFromGenomaComponent';
import { AlignmentManagementComponent } from '../alignment/alignmentValidation/alignmentManagementComponent';
import { AlignmentValidationComponent } from '../alignment/alignmentValidation/alignmentValidationComponent';
import { CreateGenomaTaskModal } from '../alignment/alignmentValidation/alignmentValidationModals/createGenomaTaskModal';
import { SharedModule } from './sharedModule';




@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        AlignmentValidationComponent,
        AlignFromGenomaComponent,
        AlignFromFileComponent,
        AlignmentManagementComponent,
        //modals
        CreateGenomaTaskModal
    ],
    exports: [AlignFromGenomaComponent],
    providers: [],
    entryComponents: [
        CreateGenomaTaskModal
    ]
})
export class AlignmentModule { }