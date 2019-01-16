import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatasetCatalogModal } from '../config/dataManagement/datasetCatalog/datasetCatalogModal';
import { DatasetDescriptionComponent } from '../config/dataManagement/datasetCatalog/datasetDescriptionComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        DatasetDescriptionComponent,
        //modals
        DatasetCatalogModal
    ],
    exports: [],
    providers: [],
    entryComponents: [
        DatasetCatalogModal
    ]
})
export class DatasetCatalogModule { }