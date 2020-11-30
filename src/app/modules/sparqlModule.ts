import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ExportResultAsRdfModal } from '../sparql/exportResultAsRdfModal';
import { QueryParameterizerModal } from '../sparql/queryParameterization/queryParameterizerModal';
import { SparqlComponent } from '../sparql/sparqlComponent';
import { SparqlTabComponent } from '../sparql/sparqlTabComponent';
import { SparqlTabParametrizedComponent } from '../sparql/sparqlTabParametrizedComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        TranslateModule,
    ],
    declarations: [
        SparqlComponent, SparqlTabComponent, SparqlTabParametrizedComponent,
        //modals
        ExportResultAsRdfModal, QueryParameterizerModal
    ],
    exports: [SparqlComponent],
    providers: [],
    entryComponents: [ExportResultAsRdfModal, QueryParameterizerModal]
})
export class SparqlModule { }