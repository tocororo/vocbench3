import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetadataManagementComponent } from "../config/dataManagement/metadata/metadataManagementComponent";
import { DatasetMetadataComponent } from "../config/dataManagement/metadata/metadataRegistry/datasetMetadataComponent";
import { LexicalizationSetMetadataComponent } from '../config/dataManagement/metadata/metadataRegistry/lexicalizationSetMetadataComponent';
import { MetadataRegistryComponent } from "../config/dataManagement/metadata/metadataRegistry/metadataRegistryComponent";
import { NewCatalogRecordModal } from '../config/dataManagement/metadata/metadataRegistry/newCatalogRecordModal';
import { NewDatasetVersionModal } from '../config/dataManagement/metadata/metadataRegistry/newDatasetVersionModal';
import { NewEmbeddedLexicalizationModal } from '../config/dataManagement/metadata/metadataRegistry/newEmbeddedLexicalizationModal';
import { metadataRouting } from "../config/dataManagement/metadata/metadataRoutes";
import { MetadataVocabulariesComponent } from "../config/dataManagement/metadata/metadataVocabularies/metadataVocabulariesComponent";
import { ImportOntologyModal } from '../config/dataManagement/metadata/namespacesAndImports/importOntologyModal';
import { ImportTreeComponent } from '../config/dataManagement/metadata/namespacesAndImports/importTree/importTreeComponent';
import { ImportTreeNodeComponent } from '../config/dataManagement/metadata/namespacesAndImports/importTree/importTreeNode';
import { NamespacesAndImportsComponent } from "../config/dataManagement/metadata/namespacesAndImports/namespacesAndImportsComponent";
import { OntologyMirrorModal } from '../config/dataManagement/metadata/namespacesAndImports/ontologyMirrorModal';
import { PrefixNamespaceModal } from '../config/dataManagement/metadata/namespacesAndImports/prefixNamespaceModal';
import { ResourceViewModule } from './resourceViewModule';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, ResourceViewModule, metadataRouting],
    declarations: [
        MetadataManagementComponent,
        MetadataVocabulariesComponent,
        NamespacesAndImportsComponent,
        MetadataRegistryComponent, DatasetMetadataComponent, LexicalizationSetMetadataComponent,
        ImportTreeComponent, ImportTreeNodeComponent,
        //modals
        ImportOntologyModal, PrefixNamespaceModal, OntologyMirrorModal, NewCatalogRecordModal,
        NewDatasetVersionModal, NewEmbeddedLexicalizationModal
    ],
    exports: [],
    providers: [],
    entryComponents: [
        ImportOntologyModal, PrefixNamespaceModal, OntologyMirrorModal, NewCatalogRecordModal, 
        NewDatasetVersionModal, NewEmbeddedLexicalizationModal
    ]
})
export class MetadataModule { }