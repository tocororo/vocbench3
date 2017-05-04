import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule} from './sharedModule';

import {BasicModalServices} from "../widget/modal/basicModal/basicModalServices";
import {BrowsingModalServices} from "../widget/modal/browsingModal/browsingModalServices";

import {CustomFormModal} from '../customForms/customForm/customFormModal';
import {CustomForm} from '../customForms/customForm/customFormComponent';
import {ConverterPickerModal} from '../customForms/customFormConfigModals/converterPickerModal';
import {SignaturePickerModal} from '../customForms/customFormConfigModals/signaturePickerModal';
import {FormCollMappingModal} from '../customForms/customFormConfigModals/formCollMappingModal';
import {FormCollEditorModal} from '../customForms/customFormConfigModals/formCollEditorModal';
import {CustomFormEditorModal} from '../customForms/customFormConfigModals/customFormEditorModal';
import {ImportCfModal} from '../customForms/customFormConfigModals/importCfModal';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    providers: [BasicModalServices, BrowsingModalServices],
    declarations: [
        CustomForm,
        FormCollMappingModal, FormCollEditorModal, CustomFormEditorModal,
        CustomFormModal, ConverterPickerModal, SignaturePickerModal,
        ImportCfModal
    ],
    exports: [CustomForm], //exported since is used in vbModalModule as well in newResourceCfModal
    entryComponents: [
        FormCollMappingModal, FormCollEditorModal, CustomFormEditorModal,
        CustomFormModal, ConverterPickerModal, SignaturePickerModal,
        ImportCfModal
    ]
})
export class CustomFormModule { }