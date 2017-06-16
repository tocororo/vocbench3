import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from './sharedModule';

import { HistoryComponent } from '../historyValidation/historyComponent';
import { ValidationComponent } from '../historyValidation/validationComponent';
import { HistoryFilterComponent } from '../historyValidation/historyFilterComponent';
import { CommitDeltaModal } from '../historyValidation/commitDeltaModal';
import { OperationSelectModal } from '../historyValidation/operationSelectModal';

@NgModule({
    imports: [
        CommonModule, FormsModule, SharedModule
    ],
    declarations: [
        HistoryComponent, ValidationComponent, HistoryFilterComponent,
        //modals
        OperationSelectModal, CommitDeltaModal
    ],
    exports: [
        HistoryComponent, ValidationComponent
    ],
    providers: [],
    entryComponents: [
        OperationSelectModal, CommitDeltaModal
    ]
})
export class HistoryValidationModule { }