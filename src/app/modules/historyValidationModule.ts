import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommitDeltaModal } from '../historyValidation/modals/commitDeltaModal';
import { HistoryComponent } from '../historyValidation/historyComponent';
import { HistoryFilterComponent } from '../historyValidation/historyFilterComponent';
import { OperationParamsModal } from '../historyValidation/modals/operationParamsModal';
import { OperationSelectModal } from '../historyValidation/modals/operationSelectModal';
import { ValidationCommentsModal } from '../historyValidation/modals/validationCommentsModal';
import { ValidationComponent } from '../historyValidation/validationComponent';
import { SharedModule } from './sharedModule';
import { HistoryValidationModalServices } from '../historyValidation/modals/historyValidationModalServices';

@NgModule({
    imports: [
        CommonModule, FormsModule, SharedModule
    ],
    declarations: [
        HistoryComponent, ValidationComponent, HistoryFilterComponent,
        //modals
        OperationSelectModal, CommitDeltaModal, OperationParamsModal, ValidationCommentsModal
    ],
    exports: [
        HistoryComponent, ValidationComponent
    ],
    providers: [
        HistoryValidationModalServices
    ],
    entryComponents: [
        OperationSelectModal, CommitDeltaModal, OperationParamsModal, ValidationCommentsModal
    ]
})
export class HistoryValidationModule { }