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
import { BrokenCFStructReportModal } from '../customForms/editors/brokenCFStructReportModal';
import { CustomFormEditorModal } from '../customForms/editors/customFormEditorModal';
import { AdvancedGraphEditor } from '../customForms/editors/customFormWizard/advancedGraphEditor';
import { ConstraintValuesSelector } from '../customForms/editors/customFormWizard/constraintValuesSelector';
import { ConverterConfigModal } from '../customForms/editors/customFormWizard/converterConfigModal';
import { CustomFormWizardFieldsEditor } from '../customForms/editors/customFormWizard/customFormWizardFieldsEditor';
import { CustomFormWizardGraphEditor } from '../customForms/editors/customFormWizard/customFormWizardGraphEditor';
import { CustomFormWizardModal } from '../customForms/editors/customFormWizard/customFormWizardModal';
import { CustomFormWizardNodesEditor } from '../customForms/editors/customFormWizard/customFormWizardNodesEditor';
import { RoleSelector } from '../customForms/editors/customFormWizard/roleSelector';
import { ExtractFromShaclModal } from '../customForms/editors/extractFromShaclModal';
import { FormCollEditorModal } from '../customForms/editors/formCollEditorModal';
import { FormCollMappingModal } from '../customForms/editors/formCollMappingModal';
import { ImportCfModal } from '../customForms/editors/importCfModal';
import { PearlInferenceValidationModal } from '../customForms/editors/pearlInferenceValidationModal';
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
        AdvancedGraphEditor,
        BrokenCFStructReportModal,
        ConstraintValuesSelector,
        CustomFormConfigComponent,
        CustomFormComponent,
        CustomFormEditorModal,
        CustomFormField,
        CustomFormFieldList,
        CustomFormModal,
        CustomFormWizardFieldsEditor,
        CustomFormWizardGraphEditor,
        CustomFormWizardNodesEditor,
        CustomFormWizardModal,
        ExtractFromShaclModal,
        FormCollEditorModal,
        FormCollMappingModal,
        ConverterConfigModal,
        ImportCfModal,
        PearlInferenceValidationModal,
        RoleSelector,
    ],
    exports: [
        CustomFormConfigComponent,
        CustomFormComponent //exported since is used in vbModalModule (creation dialogs)
    ], 
    entryComponents: [
        AdvancedGraphEditor,
        BrokenCFStructReportModal,
        CustomFormEditorModal,
        CustomFormModal,
        CustomFormWizardModal,
        ExtractFromShaclModal,
        FormCollMappingModal,
        FormCollEditorModal,
        ConverterConfigModal,
        ImportCfModal,
        PearlInferenceValidationModal,
    ]
})
export class CustomFormModule { }