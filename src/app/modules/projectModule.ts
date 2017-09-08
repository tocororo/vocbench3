import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './sharedModule';

import { ProjectComponent } from "../project/projectComponent";
import { ImportProjectComponent } from "../project/importProject/importProjectComponent";
import { CreateProjectComponent } from "../project/createProject/createProjectComponent";

//modals
import { ProjectPropertiesModal } from "../project/projectPropertiesModal";
import { ProjectACLModal } from "../project/projectACL/projectACLModal";
import { ACLEditorModal } from "../project/projectACL/aclEditorModal";
import { ProjectTableConfigModal } from "../project/projectTableConfig/projectTableConfigModal";
import { ProjectListModal } from "../project/projectListModal";


@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        ProjectComponent, ImportProjectComponent, CreateProjectComponent,
        //modals
        ProjectPropertiesModal, ProjectACLModal, ACLEditorModal, ProjectTableConfigModal, ProjectListModal
    ],
    exports: [ProjectComponent],
    providers: [],
    entryComponents: [ProjectPropertiesModal, ProjectACLModal, ACLEditorModal, ProjectTableConfigModal, ProjectListModal]
})
export class ProjectModule { }