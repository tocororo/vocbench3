import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MetadataManagementComponent } from "../config/dataManagement/metadata/metadataManagementComponent";
import { MetadataVocabulariesComponent } from "../config/dataManagement/metadata/metadataVocabularies/metadataVocabulariesComponent";
import { NamespacesAndImportsComponent } from "../config/dataManagement/metadata/namespacesAndImports/namespacesAndImportsComponent";

import { ImportTreeComponent } from '../config/dataManagement/metadata/namespacesAndImports/importTree/importTreeComponent'
import { ImportTreeNodeComponent } from '../config/dataManagement/metadata/namespacesAndImports/importTree/importTreeNode'

import { metadataRouting } from "../config/dataManagement/metadata/metadataRoutes";

@NgModule({
    imports: [CommonModule, FormsModule, metadataRouting],
    declarations: [
        MetadataManagementComponent,
        MetadataVocabulariesComponent,
        NamespacesAndImportsComponent,
        ImportTreeComponent, ImportTreeNodeComponent
    ],
    exports: [],
    providers: []
})
export class MetadataModule { }