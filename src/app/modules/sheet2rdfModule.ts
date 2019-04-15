import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConverterConfigurationComponent } from '../sheet2rdf/s2rdfModals/converterConfig/converterConfigurationComponent';
import { ListParamEditor } from '../sheet2rdf/s2rdfModals/converterConfig/listParamEditor';
import { MapParamEditor } from '../sheet2rdf/s2rdfModals/converterConfig/mapParamEditor';
import { HeaderEditorModal } from '../sheet2rdf/s2rdfModals/headerEditorModal';
import { NodeCreationModal } from '../sheet2rdf/s2rdfModals/nodeCreationModal';
import { SimpleGraphApplicationModal } from '../sheet2rdf/s2rdfModals/simpleGraphApplicationModal';
import { SubjectHeaderEditorModal } from '../sheet2rdf/s2rdfModals/subjectHeaderEditorModal';
import { Sheet2RdfComponent } from '../sheet2rdf/sheet2rdfComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule],
    declarations: [
        Sheet2RdfComponent, ConverterConfigurationComponent, MapParamEditor, ListParamEditor,
        //modal
        HeaderEditorModal, SubjectHeaderEditorModal, SimpleGraphApplicationModal, NodeCreationModal
    ],
    exports: [
        Sheet2RdfComponent
    ],
    entryComponents: [HeaderEditorModal, SubjectHeaderEditorModal, SimpleGraphApplicationModal, NodeCreationModal]
})
export class Sheet2RdfModule { }