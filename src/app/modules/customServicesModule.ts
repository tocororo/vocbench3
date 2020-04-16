import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomOperationComponent } from '../customServices/customOperationComponent';
import { CustomServiceComponent } from '../customServices/customServiceComponent';
import { CustomServicesComponent } from '../customServices/customServicesPageComponent';
import { CustomOperationEditorModal } from '../customServices/modals/customOperationEditorModal';
import { CustomServiceEditorModal } from '../customServices/modals/customServiceEditorModal';
import { OperationTypeEditor } from '../customServices/modals/operationTypeEditor';
import { SharedModule } from './sharedModule';


@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        CustomOperationComponent,
        CustomOperationEditorModal,
        CustomServicesComponent,
        CustomServiceComponent,
        CustomServiceEditorModal,
        OperationTypeEditor,
    ],
    exports: [
        CustomServicesComponent
    ],
    providers: [],
    entryComponents: [
        CustomOperationEditorModal,
        CustomServiceEditorModal,
    ]
})
export class CustomServicesModule { }