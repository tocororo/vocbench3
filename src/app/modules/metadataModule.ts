import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DatasetMetadataComponent } from "../metadata/metadataRegistry/datasetMetadataComponent";
import { LexicalizationSetMetadataComponent } from '../metadata/metadataRegistry/lexicalizationSetMetadataComponent';
import { MetadataRegistryComponent } from "../metadata/metadataRegistry/metadataRegistryComponent";
import { NewCatalogRecordModal } from '../metadata/metadataRegistry/newCatalogRecordModal';
import { NewDatasetVersionModal } from '../metadata/metadataRegistry/newDatasetVersionModal';
import { NewEmbeddedLexicalizationModal } from '../metadata/metadataRegistry/newEmbeddedLexicalizationModal';
import { MetadataVocabulariesComponent } from "../metadata/metadataVocabularies/metadataVocabulariesComponent";
import { ImportFromDatasetCatalogModal } from '../metadata/namespacesAndImports/importFromDatasetCatalogModal';
import { ImportOntologyModal } from '../metadata/namespacesAndImports/importOntologyModal';
import { ImportTreeComponent } from '../metadata/namespacesAndImports/importTree/importTreeComponent';
import { ImportTreeNodeComponent } from '../metadata/namespacesAndImports/importTree/importTreeNode';
import { NamespacesAndImportsComponent } from "../metadata/namespacesAndImports/namespacesAndImportsComponent";
import { OntologyMirrorModal } from '../metadata/namespacesAndImports/ontologyMirrorModal';
import { ResourceViewModule } from './resourceViewModule';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        ResourceViewModule,
        TranslateModule
    ],
    declarations: [
        MetadataVocabulariesComponent,
        NamespacesAndImportsComponent,
        MetadataRegistryComponent, DatasetMetadataComponent, LexicalizationSetMetadataComponent,
        ImportTreeComponent, ImportTreeNodeComponent,
        //modals
        ImportOntologyModal, ImportFromDatasetCatalogModal, OntologyMirrorModal, NewCatalogRecordModal, NewDatasetVersionModal,
        NewEmbeddedLexicalizationModal
    ],
    exports: [],
    providers: [],
    entryComponents: [
        ImportOntologyModal, ImportFromDatasetCatalogModal, OntologyMirrorModal, NewCatalogRecordModal,  NewDatasetVersionModal, 
        NewEmbeddedLexicalizationModal
    ]
})
export class MetadataModule { }