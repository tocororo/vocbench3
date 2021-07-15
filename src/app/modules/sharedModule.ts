import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgbDropdownModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ExplainableTripleComponent } from '../icv/owlConsistencyViolations/explainableTripleComponent';
import { ProjectListComponent } from '../project/projectListPanel/projectListComponent';
import { QueryParameterForm } from '../sparql/queryParameterization/queryParameterForm';
import { YasguiComponent } from '../sparql/yasguiComponent';
import { HtmlEditorComponent } from '../widget/codemirror/htmlEditor/htmlEditorComponent';
import { JsonEditorComponent } from '../widget/codemirror/jsonEditor/jsonEditorComponent';
import { ManchesterEditorComponent } from '../widget/codemirror/manchesterEditor/manchesterEditorComponent';
import { MustacheEditorComponent } from '../widget/codemirror/mustacheEditor/mustacheEditorComponent';
import { NTripleEditorComponent } from '../widget/codemirror/nTripleEditor/nTripleEditorComponent';
import { PearlEditorComponent } from "../widget/codemirror/pearlEditor/pearlEditorComponent";
import { TurtleEditorComponent } from '../widget/codemirror/turtleEditor/turtleEditorComponent';
import { ConverterConfiguratorComponent } from '../widget/converterConfigurator/converterConfiguratorComponent';
import { ListParamEditor } from '../widget/converterConfigurator/listParamEditor';
import { MapParamEditor } from '../widget/converterConfigurator/mapParamEditor';
import { ResizableDirective } from "../widget/directives/resizableDirective";
import { SanitizerDirective } from "../widget/directives/sanitizerDirective";
import { ExtensionConfiguratorComponent } from '../widget/extensionConfigurator/extensionConfiguratorComponent';
import { InlineEditableValue } from '../widget/inlineEditableValue/inlineEditableValue';
import { InputEditableComponent } from '../widget/inputEditable/inputEditableComponent';
import { LangStringEditorComponent } from '../widget/langStringEditor/langStringEditorComponent';
import { LanguageItemComponent } from '../widget/languageItem/languageItemComponent';
import { PartitionFilterEditor } from '../widget/partitionFilterEditor/partitionFilterEditor';
import { DatatypePickerComponent } from '../widget/pickers/datatypePicker/datatypePickerComponent';
import { DatetimePickerComponent } from '../widget/pickers/datetimePicker/datetimePickerComponent';
import { FilePickerComponent } from '../widget/pickers/filePicker/filePickerComponent';
import { LangPickerComponent } from '../widget/pickers/langPicker/langPickerComponent';
import { LiteralPickerComponent } from '../widget/pickers/valuePicker/literalPickerComponent';
import { ResourcePickerComponent } from '../widget/pickers/valuePicker/resourcePickerComponent';
import { ValuePickerComponent } from '../widget/pickers/valuePicker/valuePickerComponent';
import { RdfResourceComponent } from '../widget/rdfResource/rdfResourceComponent';
import { ResourceListComponent } from '../widget/rdfResource/resourceListComponent';
import { DataSizeRenderer } from '../widget/settingsRenderer/dataSizeRenderer';
import { NestedSettingSetRendererComponent } from '../widget/settingsRenderer/nestedSettingsRendererComponent';
import { SettingMapRendererComponent } from '../widget/settingsRenderer/settingMapRendererComponent';
import { SettingPropRendererComponent } from '../widget/settingsRenderer/settingPropRendererComponent';
import { SettingSetRendererComponent } from '../widget/settingsRenderer/settingSetRendererComponent';
import { SettingsRendererComponent } from '../widget/settingsRenderer/settingsRendererComponent';
import { SettingsRendererPanelComponent } from '../widget/settingsRenderer/settingsRendererPanelComponent';
import { SettingValueRendererComponent } from '../widget/settingsRenderer/settingValueRendererComponent';
import { ToastsContainer } from '../widget/toast/toastContainer';
import { ToastService } from '../widget/toast/toastService';
import { TypedLiteralInputComponent } from '../widget/typedLiteralInput/typedLiteralInputComponent';


@NgModule({
    imports: [
        CodemirrorModule,
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        NgbToastModule,
        TranslateModule,
    ],
    declarations: [
        ConverterConfiguratorComponent,
        DataSizeRenderer,
        DatatypePickerComponent,
        DatetimePickerComponent,
        ExplainableTripleComponent,
        ExtensionConfiguratorComponent,
        FilePickerComponent,
        HtmlEditorComponent,
        InlineEditableValue,
        InputEditableComponent,
        JsonEditorComponent,
        LangPickerComponent,
        LangStringEditorComponent,
        LanguageItemComponent,
        ListParamEditor,
        LiteralPickerComponent,
        ManchesterEditorComponent,
        MapParamEditor,
        MustacheEditorComponent,
        NTripleEditorComponent,
        PartitionFilterEditor,
        PearlEditorComponent,
        ProjectListComponent,
        QueryParameterForm,
        RdfResourceComponent,
        ResizableDirective,
        ResourceListComponent,
        ResourcePickerComponent,
        SanitizerDirective,
        SettingMapRendererComponent,
        SettingPropRendererComponent,
        SettingValueRendererComponent,
        SettingSetRendererComponent,
        SettingsRendererComponent,
        NestedSettingSetRendererComponent,
        SettingsRendererPanelComponent,
        ToastsContainer,
        TypedLiteralInputComponent,
        TurtleEditorComponent,
        ValuePickerComponent,
        YasguiComponent,
    ],
    exports: [
        ConverterConfiguratorComponent,
        DataSizeRenderer,
        DatatypePickerComponent,
        DatetimePickerComponent,
        ExplainableTripleComponent,
        ExtensionConfiguratorComponent,
        FilePickerComponent,
        HtmlEditorComponent,
        InlineEditableValue,
        InputEditableComponent,
        JsonEditorComponent,
        LangPickerComponent,
        LangStringEditorComponent,
        LanguageItemComponent,
        LiteralPickerComponent,
        ManchesterEditorComponent,
        MustacheEditorComponent,
        NTripleEditorComponent,
        PartitionFilterEditor,
        PearlEditorComponent,
        ProjectListComponent,
        QueryParameterForm,
        RdfResourceComponent,
        ResizableDirective,
        ResourceListComponent,
        ResourcePickerComponent,
        SanitizerDirective,
        SettingMapRendererComponent,
        SettingPropRendererComponent,
        SettingValueRendererComponent,
        SettingSetRendererComponent,
        SettingsRendererComponent,
        SettingsRendererPanelComponent,
        ToastsContainer,
        TurtleEditorComponent,
        TypedLiteralInputComponent,
        ValuePickerComponent,
        YasguiComponent,
    ],
    providers: [
        ToastService,
    ]
})
export class SharedModule { }