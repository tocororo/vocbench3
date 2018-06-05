import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExportResultAsRdfModal } from '../sparql/exportResultAsRdfModal';
import { QueryParameterRenderer } from '../sparql/queryParameterization/queryParameterRenderer';
import { QueryParameterizationMgrModal } from '../sparql/queryParameterization/queryParameterizationMgrModal';
import { QueryParameterizerModal } from '../sparql/queryParameterization/queryParameterizerModal';
import { SparqlComponent } from '../sparql/sparqlComponent';
import { SparqlTabComponent } from '../sparql/sparqlTabComponent';
import { YasguiComponent } from '../sparql/yasguiComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        SparqlComponent, SparqlTabComponent, YasguiComponent, QueryParameterRenderer,
        //modals
        ExportResultAsRdfModal, QueryParameterizerModal, QueryParameterizationMgrModal
    ],
    exports: [SparqlComponent],
    providers: [],
    entryComponents: [ExportResultAsRdfModal, QueryParameterizerModal, QueryParameterizationMgrModal]
})
export class SparqlModule { }