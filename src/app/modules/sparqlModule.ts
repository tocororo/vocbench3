import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExportResultAsRdfModal } from '../sparql/exportResultAsRdfModal';
import { QueryParameterRenderer } from '../sparql/queryParametrization/queryParameterRenderer';
import { QueryParametrizationMgrModal } from '../sparql/queryParametrization/queryParametrizationMgrModal';
import { QueryParametrizerModal } from '../sparql/queryParametrization/queryParametrizerModal';
import { SparqlComponent } from '../sparql/sparqlComponent';
import { YasguiComponent } from '../sparql/yasguiComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        SparqlComponent, YasguiComponent, QueryParameterRenderer,
        //modals
        ExportResultAsRdfModal, QueryParametrizerModal, QueryParametrizationMgrModal
    ],
    exports: [SparqlComponent],
    providers: [],
    entryComponents: [ExportResultAsRdfModal, QueryParametrizerModal, QueryParametrizationMgrModal]
})
export class SparqlModule { }