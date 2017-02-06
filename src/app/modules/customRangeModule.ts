import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule} from './sharedModule';

import {ModalServices} from "../widget/modal/modalServices";
import {BrowsingServices} from "../widget/modal/browsingModal/browsingServices";

import {CustomFormModal} from '../customRanges/customForm/customFormModal';
import {CustomRangeEditorModal} from '../customRanges/customRangeConfigModals/crEditorModal';
import {CustomRangeEntryEditorModal} from '../customRanges/customRangeConfigModals/creEditorModal';
import {CustomRangePropMappingModal} from '../customRanges/customRangeConfigModals/crPropMappingModal';
import {ConverterPickerModal} from '../customRanges/customRangeConfigModals/converterPickerModal';


@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    providers: [ModalServices, BrowsingServices],
    declarations: [
        //modals
        CustomFormModal, CustomRangeEditorModal, CustomRangeEntryEditorModal, CustomRangePropMappingModal,
        ConverterPickerModal
    ],
    exports: [],
    entryComponents: [
        CustomFormModal, CustomRangeEditorModal, CustomRangeEntryEditorModal, CustomRangePropMappingModal,
        ConverterPickerModal
    ]
})
export class CustomRangeModule { }