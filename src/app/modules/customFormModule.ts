import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CustomFormComponent } from '../customForms/customForm/customFormComponent';
import { CustomFormField } from '../customForms/customForm/customFormFieldComponent';
import { CustomFormFieldList } from '../customForms/customForm/customFormFieldListComponent';
import { CustomFormModal } from '../customForms/customForm/customFormModal';
import { CustomFormConfigComponent } from '../customForms/customFormConfComponent';
import { BrokenCFStructReportModal } from '../customForms/customFormConfigModals/brokenCFStructReportModal';
import { CustomFormEditorModal } from '../customForms/customFormConfigModals/customFormEditorModal';
import { ConstraintValuesSelector } from '../customForms/customFormConfigModals/customFormWizard/constraintValuesSelector';
import { CustomFormWizardModal } from '../customForms/customFormConfigModals/customFormWizard/customFormWizardModal';
import { GraphEntryPointModal } from '../customForms/customFormConfigModals/customFormWizard/graphEntryPointModal';
import { RoleSelector } from '../customForms/customFormConfigModals/customFormWizard/roleSelector';
import { ExtractFromShaclModal } from '../customForms/customFormConfigModals/extractFromShaclModal';
import { FormCollEditorModal } from '../customForms/customFormConfigModals/formCollEditorModal';
import { FormCollMappingModal } from '../customForms/customFormConfigModals/formCollMappingModal';
import { ImportCfModal } from '../customForms/customFormConfigModals/importCfModal';
import { PearlInferenceValidationModal } from '../customForms/customFormConfigModals/pearlInferenceValidationModal';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { SharedModule } from './sharedModule';
import { Sheet2RdfModule } from './sheet2rdfModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        Sheet2RdfModule, //for Converter configurator
        TranslateModule
    ],
    providers: [BasicModalServices, BrowsingModalServices],
    declarations: [
        BrokenCFStructReportModal,
        ConstraintValuesSelector,
        CustomFormConfigComponent,
        CustomFormComponent,
        CustomFormEditorModal,
        CustomFormField,
        CustomFormFieldList,
        CustomFormModal,
        CustomFormWizardModal,
        ExtractFromShaclModal,
        FormCollEditorModal,
        FormCollMappingModal,
        GraphEntryPointModal,
        ImportCfModal,
        PearlInferenceValidationModal,
        RoleSelector,
    ],
    exports: [CustomFormConfigComponent, CustomFormComponent], //CustomForm exported since is used in vbModalModule as well in newResourceCfModal
    entryComponents: [
        BrokenCFStructReportModal,
        CustomFormEditorModal,
        CustomFormModal,
        CustomFormWizardModal,
        ExtractFromShaclModal,
        FormCollMappingModal,
        FormCollEditorModal,
        GraphEntryPointModal,
        ImportCfModal,
        PearlInferenceValidationModal,
    ]
})
export class CustomFormModule { }