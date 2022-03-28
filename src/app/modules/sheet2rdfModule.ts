import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AdvancedGraphApplicationModal } from '../sheet2rdf/s2rdfModals/advancedGraphApplicationModal';
import { HeaderEditorModal } from '../sheet2rdf/s2rdfModals/headerEditorModal';
import { MemoizationEditor } from '../sheet2rdf/s2rdfModals/memoizationEditor';
import { NodeCreationModal } from '../sheet2rdf/s2rdfModals/nodeCreationModal';
import { Sheet2RdfSettingsModal } from '../sheet2rdf/s2rdfModals/sheet2rdfSettingsModal';
import { SimpleGraphApplicationModal } from '../sheet2rdf/s2rdfModals/simpleGraphApplicationModal';
import { SubjectHeaderEditorModal } from '../sheet2rdf/s2rdfModals/subjectHeaderEditorModal';
import { Sheet2RdfComponent } from '../sheet2rdf/sheet2rdfComponent';
import { Sheet2RdfContextService } from '../sheet2rdf/sheet2rdfContext';
import { SheetManagerComponent } from '../sheet2rdf/sheetManagerComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        RouterModule,
        SharedModule,
        TranslateModule,
    ],
    declarations: [
        MemoizationEditor,
        Sheet2RdfComponent, 
        SheetManagerComponent,
        //modal
        HeaderEditorModal, SubjectHeaderEditorModal, SimpleGraphApplicationModal, AdvancedGraphApplicationModal, NodeCreationModal, 
        Sheet2RdfSettingsModal
    ],
    exports: [
        Sheet2RdfComponent,
    ],
    providers: [
        Sheet2RdfContextService
    ],
    entryComponents: [
        HeaderEditorModal, SubjectHeaderEditorModal, SimpleGraphApplicationModal, AdvancedGraphApplicationModal, NodeCreationModal,
        Sheet2RdfSettingsModal
    ]
})
export class Sheet2RdfModule { }