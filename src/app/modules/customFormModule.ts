import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomFormComponent } from '../customForms/customForm/customFormComponent';
import { CustomFormField } from '../customForms/customForm/customFormFieldComponent';
import { CustomFormFieldList } from '../customForms/customForm/customFormFieldListComponent';
import { CustomFormModal } from '../customForms/customForm/customFormModal';
import { CustomFormConfigComponent } from '../customForms/customFormConfComponent';
import { BrokenCFStructReportModal } from '../customForms/customFormConfigModals/brokenCFStructReportModal';
import { CustomFormEditorModal } from '../customForms/customFormConfigModals/customFormEditorModal';
import { FormCollEditorModal } from '../customForms/customFormConfigModals/formCollEditorModal';
import { FormCollMappingModal } from '../customForms/customFormConfigModals/formCollMappingModal';
import { ImportCfModal } from '../customForms/customFormConfigModals/importCfModal';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    providers: [BasicModalServices, BrowsingModalServices],
    declarations: [
        BrokenCFStructReportModal,
        CustomFormConfigComponent,
        CustomFormComponent,
        CustomFormEditorModal,
        CustomFormField,
        CustomFormFieldList,
        CustomFormModal,
        FormCollEditorModal,
        FormCollMappingModal,
        ImportCfModal
    ],
    exports: [CustomFormConfigComponent, CustomFormComponent], //CustomForm exported since is used in vbModalModule as well in newResourceCfModal
    entryComponents: [
        FormCollMappingModal, FormCollEditorModal, CustomFormEditorModal,
        CustomFormModal, BrokenCFStructReportModal, ImportCfModal
    ]
})
export class CustomFormModule { }