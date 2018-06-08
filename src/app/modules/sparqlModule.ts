import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExportResultAsRdfModal } from '../sparql/exportResultAsRdfModal';
import { QueryParameterizerModal } from '../sparql/queryParameterization/queryParameterizerModal';
import { QueryParameterRenderer } from '../sparql/queryParameterization/queryParameterRenderer';
import { SparqlComponent } from '../sparql/sparqlComponent';
import { SparqlTabComponent } from '../sparql/sparqlTabComponent';
import { SparqlTabParametrizedComponent } from '../sparql/sparqlTabParametrizedComponent';
import { YasguiComponent } from '../sparql/yasguiComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        SparqlComponent, SparqlTabComponent, SparqlTabParametrizedComponent, YasguiComponent, QueryParameterRenderer,
        //modals
        ExportResultAsRdfModal, QueryParameterizerModal
    ],
    exports: [SparqlComponent],
    providers: [],
    entryComponents: [ExportResultAsRdfModal, QueryParameterizerModal]
})
export class SparqlModule { }