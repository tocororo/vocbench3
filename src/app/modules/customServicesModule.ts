import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomServiceRouterComponent } from '../customServices/customServiceRouterComponent';
import { CustomOperationComponent } from '../customServices/customServicesEditor/customOperationComponent';
import { CustomServiceComponent } from '../customServices/customServicesEditor/customServiceComponent';
import { CustomServicesPageComponent } from '../customServices/customServicesEditor/customServicesPageComponent';
import { AuthorizationHelperModal } from '../customServices/customServicesEditor/modals/authorizationHelperModal';
import { CustomOperationEditorModal } from '../customServices/customServicesEditor/modals/customOperationEditorModal';
import { CustomOperationModal } from '../customServices/customServicesEditor/modals/customOperationModal';
import { CustomServiceEditorModal } from '../customServices/customServicesEditor/modals/customServiceEditorModal';
import { CustomServiceModalServices } from '../customServices/customServicesEditor/modals/customServiceModalServices';
import { OperationTypeEditor } from '../customServices/customServicesEditor/modals/operationTypeEditor';
import { InvokableReporterComponent } from '../customServices/invokableReporters/invokableReporterComponent';
import { InvokableReportersPageComponent } from '../customServices/invokableReporters/invokableReportersPageComponent';
import { InvokableReporterEditorModal } from '../customServices/invokableReporters/modals/invokableReporterEditorModal';
import { InvokableReporterModalServices } from '../customServices/invokableReporters/modals/invokableReporterModalServices';
import { ServiceInvocationEditorModal } from '../customServices/invokableReporters/modals/serviceInvocationEditorModal';
import { ServiceInvocationComponent } from '../customServices/invokableReporters/serviceInvocationComponent';
import { SharedModule } from './sharedModule';


@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        AuthorizationHelperModal,
        CustomOperationComponent,
        CustomOperationEditorModal,
        CustomOperationModal,
        CustomServicesPageComponent,
        CustomServiceRouterComponent,
        CustomServiceComponent,
        CustomServiceEditorModal,
        InvokableReportersPageComponent,
        InvokableReporterComponent,
        InvokableReporterEditorModal,
        ServiceInvocationComponent,
        ServiceInvocationEditorModal,
        OperationTypeEditor,
    ],
    exports: [
        CustomServiceRouterComponent
    ],
    providers: [
        CustomServiceModalServices, InvokableReporterModalServices
    ],
    entryComponents: [
        AuthorizationHelperModal,
        CustomOperationEditorModal,
        CustomOperationModal,
        CustomServiceEditorModal,
        InvokableReporterEditorModal,
        ServiceInvocationEditorModal,
    ]
})
export class CustomServicesModule { }