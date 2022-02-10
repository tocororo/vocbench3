import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LoadShapesModal } from '../shacl/loadShapesModal';
import { ShaclBatchValidationModal } from '../shacl/shaclBatchValidationModal';
import { ShaclReportEditorComponent } from '../shacl/shaclReportEditorComponent';
import { SharedModule } from './sharedModule';


@NgModule({
    imports: [
        CodemirrorModule,
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        TranslateModule,
    ],
    declarations: [
        LoadShapesModal,
        ShaclBatchValidationModal,
        ShaclReportEditorComponent
    ],
    exports: [
    ],
    providers: [
    ],
    entryComponents: [
        LoadShapesModal,
        ShaclBatchValidationModal
    ]
})
export class ShaclModule { }