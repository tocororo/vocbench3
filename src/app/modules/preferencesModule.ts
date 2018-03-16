import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './sharedModule';

import { VocbenchPreferencesComponent } from "../preferences/vocbenchPreferencesComponent";
import { LanguagePreferencesComponent } from "../preferences/languagePreferencesComponent";
import { LanguageEditingComponent } from "../preferences/languages/languageEditingComponent";
import { LanguageRenderingComponent } from "../preferences/languages/languageRenderingComponent";

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        VocbenchPreferencesComponent, LanguagePreferencesComponent,
        LanguageEditingComponent, LanguageRenderingComponent
    ],
    exports: [VocbenchPreferencesComponent],
    providers: [],
})
export class PreferencesModule { }