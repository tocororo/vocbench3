import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomOperationEditor } from '../customServices/customOperationEditor';
import { CustomServiceEditor } from '../customServices/customServiceEditor';
import { CustomServicesComponent } from '../customServices/customServicesComponent';
import { SharedModule } from './sharedModule';


@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        CustomOperationEditor,
        CustomServicesComponent,
        CustomServiceEditor,
    ],
    exports: [
        CustomServicesComponent
    ],
    providers: [],
    entryComponents: []
})
export class CustomServicesModule { }