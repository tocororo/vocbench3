import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './sharedModule';

import { MetadataManagementComponent } from "../config/dataManagement/metadata/metadataManagementComponent";
import { MetadataVocabulariesComponent } from "../config/dataManagement/metadata/metadataVocabularies/metadataVocabulariesComponent";
import { NamespacesAndImportsComponent } from "../config/dataManagement/metadata/namespacesAndImports/namespacesAndImportsComponent";

import { ImportTreeComponent } from '../config/dataManagement/metadata/namespacesAndImports/importTree/importTreeComponent'
import { ImportTreeNodeComponent } from '../config/dataManagement/metadata/namespacesAndImports/importTree/importTreeNode'

//modals
import { ImportOntologyModal } from '../config/dataManagement/metadata/namespacesAndImports/importOntologyModal';
import { PrefixNamespaceModal } from '../config/dataManagement/metadata/namespacesAndImports/prefixNamespaceModal';

import { metadataRouting } from "../config/dataManagement/metadata/metadataRoutes";

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, metadataRouting],
    declarations: [
        MetadataManagementComponent,
        MetadataVocabulariesComponent,
        NamespacesAndImportsComponent,
        ImportTreeComponent, ImportTreeNodeComponent,
        //modals
        ImportOntologyModal, PrefixNamespaceModal
    ],
    exports: [],
    providers: [],
    entryComponents: [ImportOntologyModal, PrefixNamespaceModal]
})
export class MetadataModule { }