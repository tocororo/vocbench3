import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CreateProjectComponent } from "../project/createProject/createProjectComponent";
import { ACLEditorModal } from "../project/projectACL/aclEditorModal";
import { ProjectACLModal } from '../project/projectACL/projectACLModal';
import { ProjectComponent } from "../project/projectComponent";
import { ProjectListModal } from "../project/projectListModal";
import { ProjectPropertiesModal } from "../project/projectPropertiesModal";
import { ProjectTableConfigModal } from "../project/projectTableConfig/projectTableConfigModal";
import { DeleteRemoteRepoModal } from '../project/remoteRepositories/deleteRemoteRepoModal';
import { DeleteRepositoryReportModal } from '../project/remoteRepositories/deleteRepositoryReportModal';
import { RemoteRepoEditorModal } from "../project/remoteRepositories/remoteRepoEditorModal";
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        TranslateModule
    ],
    declarations: [
        CreateProjectComponent,
        ProjectComponent,
        //modals
        ACLEditorModal, 
        DeleteRemoteRepoModal,
        DeleteRepositoryReportModal,
        ProjectACLModal,
        ProjectListModal, 
        ProjectPropertiesModal, 
        ProjectTableConfigModal,
        RemoteRepoEditorModal,
    ],
    exports: [ProjectComponent],
    providers: [],
    entryComponents: [
        ACLEditorModal, 
        DeleteRemoteRepoModal,
        DeleteRepositoryReportModal,
        ProjectACLModal,
        ProjectListModal, 
        ProjectPropertiesModal, 
        ProjectTableConfigModal,
        RemoteRepoEditorModal,
    ]
})
export class ProjectModule { }