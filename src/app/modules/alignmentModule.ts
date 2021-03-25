import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AlignFromFileComponent } from '../alignment/alignmentValidation/alignFromFileComponent';
import { AlignFromRemoteSystemComponent } from '../alignment/alignmentValidation/alignFromRemoteSystemComponent';
import { AlignmentManagementComponent } from '../alignment/alignmentValidation/alignmentManagementComponent';
import { AlignmentValidationComponent } from '../alignment/alignmentValidation/alignmentValidationComponent';
import { CreateRemoteAlignmentTaskModal } from '../alignment/alignmentValidation/alignmentValidationModals/createRemoteAlignmentTaskModal';
import { MapleDatasetComponent } from '../alignment/alignmentValidation/alignmentValidationModals/mapleDatasetComponent';
import { MaplePairingComponent } from '../alignment/alignmentValidation/alignmentValidationModals/maplePairingComponent';
import { RemoteSystemConfigurationsAdministration } from '../alignment/alignmentValidation/alignmentValidationModals/remoteSystemConfigurationsAdministration';
import { RemoteSystemSettingsModal } from '../alignment/alignmentValidation/alignmentValidationModals/remoteSystemSettingsModal';
import { SynonymizerDetailsModal } from '../alignment/alignmentValidation/alignmentValidationModals/synonymizerDetailsModal';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        TranslateModule,
    ],
    declarations: [
        AlignmentValidationComponent,
        AlignFromFileComponent,
        AlignFromRemoteSystemComponent,
        AlignmentManagementComponent,
        CreateRemoteAlignmentTaskModal,
        MapleDatasetComponent,
        MaplePairingComponent,
        RemoteSystemSettingsModal,
        RemoteSystemConfigurationsAdministration,
        SynonymizerDetailsModal,
    ],
    exports: [AlignFromRemoteSystemComponent],
    providers: [],
    entryComponents: [
        CreateRemoteAlignmentTaskModal,
        SynonymizerDetailsModal,
        RemoteSystemConfigurationsAdministration,
        RemoteSystemSettingsModal
    ]
})
export class AlignmentModule { }