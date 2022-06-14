import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DatasetMetadataComponent } from "../metadata/metadataRegistry/datasetMetadataComponent";
import { LexicalizationSetMetadataComponent } from '../metadata/metadataRegistry/lexicalizationSetMetadataComponent';
import { ConnectToAbsDatasetModal } from '../metadata/metadataRegistry/mdrTree/connectToAbsDatasetModal';
import { MetadataRegistryTreeComponent } from "../metadata/metadataRegistry/mdrTree/mdrTreeComponent";
import { MetadataRegistryTreeModal } from '../metadata/metadataRegistry/mdrTree/mdrTreeModal';
import { MetadataRegistryTreeNodeComponent } from '../metadata/metadataRegistry/mdrTree/mdrTreeNodeComponent';
import { MetadataRegistryTreePanelComponent } from '../metadata/metadataRegistry/mdrTree/mdrTreePanelComponent';
import { NewDatasetModal } from '../metadata/metadataRegistry/mdrTree/newDatasetModal';
import { MetadataRegistryComponent } from "../metadata/metadataRegistry/metadataRegistryComponent";
import { NewEmbeddedLexicalizationModal } from '../metadata/metadataRegistry/newEmbeddedLexicalizationModal';
import { ConflictResolverModal } from '../metadata/metadataVocabularies/conflictResolverModal';
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
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        ResourceViewModule,
        TranslateModule
    ],
    declarations: [
        DatasetMetadataComponent,
        ImportTreeComponent, 
        ImportTreeNodeComponent,
        LexicalizationSetMetadataComponent,
        MetadataRegistryComponent, 
        MetadataRegistryTreeComponent,
        MetadataRegistryTreeModal,
        MetadataRegistryTreeNodeComponent,
        MetadataRegistryTreePanelComponent,
        MetadataVocabulariesComponent,
        NamespacesAndImportsComponent,
        //modals
        ConflictResolverModal,
        ConnectToAbsDatasetModal,
        ImportOntologyModal,
        ImportFromDatasetCatalogModal,
        OntologyMirrorModal,
        NewDatasetModal,
        NewEmbeddedLexicalizationModal
    ],
    exports: [
        MetadataRegistryTreeModal
    ],
    providers: [],
    entryComponents: [
        ConflictResolverModal,
        ConnectToAbsDatasetModal,
        ImportOntologyModal, 
        ImportFromDatasetCatalogModal,
        MetadataRegistryTreeModal,
        OntologyMirrorModal,
        NewDatasetModal,
        NewEmbeddedLexicalizationModal
    ]
})
export class MetadataModule { }