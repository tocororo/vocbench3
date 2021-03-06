import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImportPatternModal } from '../resourceMetadata/modals/importPatternModal';
import { MetadataAssociationEditorModal } from '../resourceMetadata/modals/metadataAssociationEditorModal';
import { MetadataFactoryPatternSelectionModal } from '../resourceMetadata/modals/metadataFactoryPatternSelectionModal';
import { MetadataPatternEditorModal } from '../resourceMetadata/modals/metadataPatternEditorModal';
import { MetadataPatternLibraryModal } from '../resourceMetadata/modals/metadataPatternLibraryModal';
import { ResourceMetadataComponent } from '../resourceMetadata/resourceMetadataComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    providers: [],
    declarations: [
        ImportPatternModal,
        ResourceMetadataComponent,
        MetadataAssociationEditorModal,
        MetadataFactoryPatternSelectionModal,
        MetadataPatternEditorModal,
        MetadataPatternLibraryModal,
    ],
    exports: [
        ResourceMetadataComponent
    ],
    entryComponents: [
        ImportPatternModal,
        MetadataAssociationEditorModal,
        MetadataFactoryPatternSelectionModal,
        MetadataPatternEditorModal,
        MetadataPatternLibraryModal
    ]
})
export class ResourceMetadataModule { }