import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QueryParameterForm } from '../sparql/queryParameterization/queryParameterForm';
import { YasguiComponent } from '../sparql/yasguiComponent';
import { HtmlEditorComponent } from '../widget/codemirror/htmlEditor/htmlEditorComponent';
import { ManchesterEditorComponent } from '../widget/codemirror/manchesterEditor/manchesterEditorComponent';
import { NTripleEditorComponent } from '../widget/codemirror/nTripleEditor/nTripleEditorComponent';
import { PearlEditorComponent } from "../widget/codemirror/pearlEditor/pearlEditorComponent";
import { SanitizerDirective } from "../widget/directives/sanitizerDirective";
import { ExtensionConfiguratorComponent } from '../widget/extensionConfigurator/extensionConfiguratorComponent';
import { InputEditableComponent } from '../widget/inputEditable/inputEditableComponent';
import { LanguageItemComponent } from '../widget/languageItem/languageItemComponent';
import { PartitionFilterEditor } from '../widget/partitionFilterEditor/partitionFilterEditor';
import { DatatypePickerComponent } from '../widget/pickers/datatypePicker/datatypePickerComponent';
import { FilePickerComponent } from '../widget/pickers/filePicker/filePickerComponent';
import { LangPickerComponent } from '../widget/pickers/langPicker/langPickerComponent';
import { LiteralPickerComponent } from '../widget/pickers/valuePicker/literalPickerComponent';
import { ResourcePickerComponent } from '../widget/pickers/valuePicker/resourcePickerComponent';
import { ValuePickerComponent } from '../widget/pickers/valuePicker/valuePickerComponent';
import { RdfResourceComponent } from '../widget/rdfResource/rdfResourceComponent';
import { ResourceListComponent } from '../widget/rdfResource/resourceListComponent';
import { SettingMapRendererComponent } from '../widget/settingsRenderer/settingMapRendererComponent';
import { SettingSetRendererComponent } from '../widget/settingsRenderer/settingSetRendererComponent';
import { SettingsRendererComponent } from '../widget/settingsRenderer/settingsRendererComponent';
import { SettingsRendererPanelComponent } from '../widget/settingsRenderer/settingsRendererPanelComponent';
import { TypedLiteralInputComponent } from '../widget/typedLiteralInput/typedLiteralInputComponent';
import { HelperModal } from '../widget/codemirror/manchesterEditor/modal/helperModal';

@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [
        DatatypePickerComponent,
        ExtensionConfiguratorComponent,
        FilePickerComponent,
        HelperModal,
        HtmlEditorComponent,
        InputEditableComponent,
        LangPickerComponent,
        LanguageItemComponent,
        LiteralPickerComponent,
        ManchesterEditorComponent,
        NTripleEditorComponent,
        PartitionFilterEditor,
        PearlEditorComponent,
        QueryParameterForm,
        RdfResourceComponent,
        ResourceListComponent,
        ResourcePickerComponent,
        SanitizerDirective,
        SettingMapRendererComponent,
        SettingSetRendererComponent,
        SettingsRendererComponent,
        SettingsRendererPanelComponent,
        TypedLiteralInputComponent,
        ValuePickerComponent,
        YasguiComponent,
    ],
    exports: [
        DatatypePickerComponent,
        ExtensionConfiguratorComponent,
        FilePickerComponent,
        HtmlEditorComponent,
        InputEditableComponent,
        LangPickerComponent,
        LanguageItemComponent,
        LiteralPickerComponent,
        ManchesterEditorComponent,
        HelperModal,
        NTripleEditorComponent,
        PartitionFilterEditor,
        PearlEditorComponent,
        QueryParameterForm,
        RdfResourceComponent,
        ResourceListComponent,
        ResourcePickerComponent,
        SanitizerDirective,
        SettingMapRendererComponent,
        SettingSetRendererComponent,
        SettingsRendererComponent,
        SettingsRendererPanelComponent,
        TypedLiteralInputComponent,
        ValuePickerComponent,
        YasguiComponent,
    ],
    providers: []
})
export class SharedModule { }