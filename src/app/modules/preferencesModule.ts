import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguagePreferencesComponent } from "../preferences/languagePreferencesComponent";
import { LanguageEditingComponent } from "../preferences/languages/languageEditingComponent";
import { LanguageRenderingComponent } from "../preferences/languages/languageRenderingComponent";
import { LanguageValueFilterComponent } from "../preferences/languages/languageValueFilterComponent";
import { ResourceViewPreferencesComponent } from '../preferences/resourceViewPreferencesComponent';
import { VocbenchPreferencesComponent } from "../preferences/vocbenchPreferencesComponent";
import { SharedModule } from './sharedModule';


@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        VocbenchPreferencesComponent, LanguagePreferencesComponent, ResourceViewPreferencesComponent,
        LanguageEditingComponent, LanguageRenderingComponent, LanguageValueFilterComponent
    ],
    exports: [VocbenchPreferencesComponent, LanguageValueFilterComponent, ResourceViewPreferencesComponent],
    providers: [],
})
export class PreferencesModule { }