import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetadataPatternEditorModal } from '../resourceMetadata/modals/metadataPatternEditorModal';
import { ResourceMetadataComponent } from '../resourceMetadata/resourceMetadataComponent';
import { SharedModule } from './sharedModule';
import { MetadataAssociationEditorModal } from '../resourceMetadata/modals/metadataAssociationEditorModal';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    providers: [],
    declarations: [
        ResourceMetadataComponent,
        MetadataAssociationEditorModal,
        MetadataPatternEditorModal,
    ],
    exports: [
        ResourceMetadataComponent
    ],
    entryComponents: [
        MetadataAssociationEditorModal,
        MetadataPatternEditorModal,
    ]
})
export class ResourceMetadataModule { }