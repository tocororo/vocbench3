import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlignFromFileComponent } from '../alignment/alignmentValidation/alignFromFileComponent';
import { AlignFromRemoteSystemComponent } from '../alignment/alignmentValidation/alignFromRemoteSystemComponent';
import { AlignmentManagementComponent } from '../alignment/alignmentValidation/alignmentManagementComponent';
import { AlignmentValidationComponent } from '../alignment/alignmentValidation/alignmentValidationComponent';
import { CreateRemoteAlignmentTaskModal } from '../alignment/alignmentValidation/alignmentValidationModals/createRemoteAlignmentTaskModal';
import { SharedModule } from './sharedModule';




@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        AlignmentValidationComponent,
        AlignFromFileComponent,
        AlignFromRemoteSystemComponent,
        AlignmentManagementComponent,
        //modals
        CreateRemoteAlignmentTaskModal
    ],
    exports: [AlignFromRemoteSystemComponent],
    providers: [],
    entryComponents: [
        CreateRemoteAlignmentTaskModal
    ]
})
export class AlignmentModule { }