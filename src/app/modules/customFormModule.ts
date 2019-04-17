import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from './sharedModule';

import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";

import { CustomFormConfigComponent } from '../customForms/customFormConfComponent';
import { CustomFormModal } from '../customForms/customForm/customFormModal';
import { CustomFormComponent } from '../customForms/customForm/customFormComponent';
import { FormCollMappingModal } from '../customForms/customFormConfigModals/formCollMappingModal';
import { FormCollEditorModal } from '../customForms/customFormConfigModals/formCollEditorModal';
import { CustomFormEditorModal } from '../customForms/customFormConfigModals/customFormEditorModal';
import { BrokenCFStructReportModal } from '../customForms/customFormConfigModals/brokenCFStructReportModal';
import { ImportCfModal } from '../customForms/customFormConfigModals/importCfModal';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    providers: [BasicModalServices, BrowsingModalServices],
    declarations: [
        CustomFormConfigComponent, CustomFormComponent,
        FormCollMappingModal, FormCollEditorModal, CustomFormEditorModal,
        CustomFormModal, BrokenCFStructReportModal, ImportCfModal
    ],
    exports: [CustomFormConfigComponent, CustomFormComponent], //CustomForm exported since is used in vbModalModule as well in newResourceCfModal
    entryComponents: [
        FormCollMappingModal, FormCollEditorModal, CustomFormEditorModal,
        CustomFormModal, BrokenCFStructReportModal, ImportCfModal
    ]
})
export class CustomFormModule { }