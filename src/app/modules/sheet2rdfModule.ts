import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from './sharedModule';

import { Sheet2RdfComponent } from '../sheet2rdf/sheet2rdfComponent';
import { HeaderEditorModal } from '../sheet2rdf/headerEditorModal';

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule],
    declarations: [
        Sheet2RdfComponent,
        //modal
        HeaderEditorModal
    ],
    exports: [
        Sheet2RdfComponent
    ],
    entryComponents: [HeaderEditorModal]
})
export class Sheet2RdfModule { }