import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomFormComponent } from '../customForms/customForm/customFormComponent';
import { CustomFormField } from '../customForms/customForm/customFormFieldComponent';
import { CustomFormFieldList } from '../customForms/customForm/customFormFieldListComponent';
import { CustomFormModal } from '../customForms/customForm/customFormModal';
import { CustomFormConfigComponent } from '../customForms/customFormConfComponent';
import { BrokenCFStructReportModal } from '../customForms/customFormConfigModals/brokenCFStructReportModal';
import { CustomFormEditorModal } from '../customForms/customFormConfigModals/customFormEditorModal';
import { ExtractFromShaclModal } from '../customForms/customFormConfigModals/extractFromShaclModal';
import { FormCollEditorModal } from '../customForms/customFormConfigModals/formCollEditorModal';
import { FormCollMappingModal } from '../customForms/customFormConfigModals/formCollMappingModal';
import { ImportCfModal } from '../customForms/customFormConfigModals/importCfModal';
import { PearlInferenceValidationModal } from '../customForms/customFormConfigModals/pearlInferenceValidationModal';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule
    ],
    providers: [BasicModalServices, BrowsingModalServices],
    declarations: [
        BrokenCFStructReportModal,
        CustomFormConfigComponent,
        CustomFormComponent,
        CustomFormEditorModal,
        CustomFormField,
        CustomFormFieldList,
        CustomFormModal,
        ExtractFromShaclModal,
        FormCollEditorModal,
        FormCollMappingModal,
        ImportCfModal,
        PearlInferenceValidationModal,
    ],
    exports: [CustomFormConfigComponent, CustomFormComponent], //CustomForm exported since is used in vbModalModule as well in newResourceCfModal
    entryComponents: [
        BrokenCFStructReportModal,
        CustomFormEditorModal,
        CustomFormModal,
        ExtractFromShaclModal,
        FormCollMappingModal,
        FormCollEditorModal,
        ImportCfModal,
        PearlInferenceValidationModal,
    ]
})
export class CustomFormModule { }