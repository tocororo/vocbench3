import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatasetCatalogModal } from '../config/dataManagement/datasetCatalog/datasetCatalogModal';
import { DatasetDescriptionComponent } from '../config/dataManagement/datasetCatalog/datasetDescriptionComponent';
import { SharedModule } from './sharedModule';
import { DataDumpSelectorModal } from '../config/dataManagement/datasetCatalog/dataDumpSelectorModal';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
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