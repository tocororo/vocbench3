import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorComponent } from "../widget/codemirror/codemirrorComponent";
import { SanitizerDirective } from "../widget/directives/sanitizerDirective";
import { ExtensionConfiguratorComponent } from '../widget/extensionConfigurator/extensionConfiguratorComponent';
import { InputEditableComponent } from '../widget/inputEditable/inputEditableComponent';
import { LanguageItemComponent } from '../widget/languageItem/languageItemComponent';
import { FilePickerComponent } from '../widget/pickers/filePicker/filePickerComponent';
import { LangPickerComponent } from '../widget/pickers/langPicker/langPickerComponent';
import { LiteralPickerComponent } from '../widget/pickers/literalPicker/literalPickerComponent';
import { ResourcePickerComponent } from '../widget/pickers/resourcePicker/resourcePickerComponent';
import { RdfResourceComponent } from '../widget/rdfResource/rdfResourceComponent';
import { ResourceListComponent } from '../widget/rdfResource/resourceListComponent';
import { SettingMapRendererComponent } from '../widget/settingsRenderer/settingMapRendererComponent';
import { SettingSetRendererComponent } from '../widget/settingsRenderer/settingSetRendererComponent';
import { SettingsRendererComponent } from '../widget/settingsRenderer/settingsRendererComponent';
import { SettingsRendererPanelComponent } from '../widget/settingsRenderer/settingsRendererPanelComponent';
import { TypedLiteralInputComponent } from '../widget/typedLiteralInput/typedLiteralInputComponent';



@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [
        FilePickerComponent, RdfResourceComponent, LangPickerComponent, SanitizerDirective,
        CodemirrorComponent, InputEditableComponent, ResourceListComponent,
        TypedLiteralInputComponent, LanguageItemComponent,
        SettingsRendererComponent, SettingsRendererPanelComponent, SettingSetRendererComponent, SettingMapRendererComponent,
        ExtensionConfiguratorComponent, ResourcePickerComponent, LiteralPickerComponent
    ],
    exports: [
        FilePickerComponent, RdfResourceComponent, SanitizerDirective, LangPickerComponent,
        CodemirrorComponent, InputEditableComponent, ResourceListComponent,
        TypedLiteralInputComponent, LanguageItemComponent, 
        SettingsRendererComponent, SettingsRendererPanelComponent, SettingSetRendererComponent, SettingMapRendererComponent,
        ExtensionConfiguratorComponent, ResourcePickerComponent, LiteralPickerComponent
    ],
    providers: []
})
export class SharedModule { }