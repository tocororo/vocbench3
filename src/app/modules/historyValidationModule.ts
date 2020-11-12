import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { HistoryComponent } from '../historyValidation/historyComponent';
import { HistoryFilterComponent } from '../historyValidation/historyFilterComponent';
import { CommitDeltaModal } from '../historyValidation/modals/commitDeltaModal';
import { HistoryValidationModalServices } from '../historyValidation/modals/historyValidationModalServices';
import { OperationParamsModal } from '../historyValidation/modals/operationParamsModal';
import { OperationSelectModal } from '../historyValidation/modals/operationSelectModal';
import { ValidationCommentsModal } from '../historyValidation/modals/validationCommentsModal';
import { ValidationComponent } from '../historyValidation/validationComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule
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