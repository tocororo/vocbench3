import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfigBarComponent } from '../config/configBar/configBarComponent';
import { ExportDataComponent } from '../config/dataManagement/exportData/exportDataComponent';
import { FilterGraphsModal } from '../config/dataManagement/exportData/filterGraphsModal/filterGraphsModal';
import { LoadDataComponent } from '../config/dataManagement/loadData/loadDataComponent';
import { RefactorComponent } from '../config/dataManagement/refactor/refactorComponent';
import { DumpCreationModal } from '../config/dataManagement/versioning/dumpCreationModal';
import { VersioningComponent } from '../config/dataManagement/versioning/versioningComponent';
import { SharedModule } from './sharedModule';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        RouterModule,
        SharedModule
    ],
    declarations: [
        ConfigBarComponent,
        DumpCreationModal,
		LoadDataComponent,
        ExportDataComponent,
        FilterGraphsModal,
		RefactorComponent,
		VersioningComponent,
    ],
    exports: [
        ConfigBarComponent,
        LoadDataComponent,
		ExportDataComponent,
		RefactorComponent,
		VersioningComponent,
    ],
    providers: [],
    entryComponents: [
        DumpCreationModal,
        FilterGraphsModal,
    ]
})
export class GlobalDataMgmtModule { }