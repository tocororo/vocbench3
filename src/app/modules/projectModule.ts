import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateProjectComponent } from "../project/createProject/createProjectComponent";
import { ACLEditorModal } from "../project/projectACL/aclEditorModal";
import { ProjectComponent } from "../project/projectComponent";
import { ProjectDirModal } from '../project/projectDir/projectDirModal';
import { ProjectListModal } from "../project/projectListModal";
import { ProjectPropertiesModal } from "../project/projectPropertiesModal";
import { ProjectTableConfigModal } from "../project/projectTableConfig/projectTableConfigModal";
import { DeleteRemoteRepoModal } from '../project/remoteRepositories/deleteRemoteRepoModal';
import { DeleteRepositoryReportModal } from '../project/remoteRepositories/deleteRepositoryReportModal';
import { RemoteRepoEditorModal } from "../project/remoteRepositories/remoteRepoEditorModal";
import { SharedModule } from './sharedModule';
import { ProjectACLModal } from '../project/projectACL/projectACLModal';




@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        CreateProjectComponent,
        ProjectComponent,
        //modals
        ACLEditorModal, 
        DeleteRemoteRepoModal,
        DeleteRepositoryReportModal,
        ProjectACLModal,
        ProjectDirModal,
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
        ProjectDirModal,
        ProjectListModal, 
        ProjectPropertiesModal, 
        ProjectTableConfigModal,
        RemoteRepoEditorModal,
    ]
})
export class ProjectModule { }