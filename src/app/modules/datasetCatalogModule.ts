import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DataDumpSelectorModal } from '../config/dataManagement/datasetCatalog/dataDumpSelectorModal';
import { DatasetCatalogModal } from '../config/dataManagement/datasetCatalog/datasetCatalogModal';
import { DatasetDescriptionComponent } from '../config/dataManagement/datasetCatalog/datasetDescriptionComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        SharedModule,
        TranslateModule
    ],
    declarations: [
        DatasetDescriptionComponent,
        //modals
        DatasetCatalogModal, DataDumpSelectorModal
    ],
    exports: [],
    providers: [],
    entryComponents: [
        DatasetCatalogModal, DataDumpSelectorModal
    ]
})
export class DatasetCatalogModule { }