import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CollaborationComponent } from '../collaboration/collaborationComponent';
import { CollaborationModalServices } from '../collaboration/collaborationModalService';
import { IssueListComponent } from '../collaboration/issueListComponent';
import { IssueListModal } from '../collaboration/issueListModal';
import { CollaborationProjectModal } from '../collaboration/modals/collaborationProjectModal';
import { CollaborationProjSettingsModal } from '../collaboration/modals/collaborationProjSettingsModal';
import { CollaborationUserSettingsModal } from '../collaboration/modals/collaborationUserSettingsModal';
import { CreateIssueModal } from '../collaboration/modals/createIssueModal';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        TranslateModule
    ],
    declarations: [
        CollaborationComponent, IssueListComponent, 
        IssueListModal, CollaborationProjectModal, CollaborationProjSettingsModal, CollaborationUserSettingsModal, CreateIssueModal,
    ],
    exports: [CollaborationComponent],
    providers: [CollaborationModalServices],
    entryComponents: [
        IssueListModal, CollaborationProjectModal, CollaborationProjSettingsModal, CollaborationUserSettingsModal, CreateIssueModal
    ]
})
export class CollaborationModule { }