import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from './sharedModule';
import { TreeAndListModule } from "./treeAndListModule";

import { ResourceViewComponent } from '../resourceView/resourceViewComponent';
import { ResourceViewModal } from '../resourceView/resourceViewModal';
import { ResourceRenameComponent } from '../resourceView/resourceRenameComponent';
import { ResourceViewContextMenu } from '../resourceView/resourceViewCtxMenu';
import { ResourceViewPanelComponent } from '../resourceView/resourceViewPanel/resourceViewPanelComponent';
import { ResourceViewSplittedComponent } from '../resourceView/resourceViewPanel/resourceViewSplittedComponent';
import { ResourceViewTabbedComponent } from '../resourceView/resourceViewPanel/resourceViewTabbedComponent';
import { ReifiedResourceComponent } from '../resourceView/resViewResources/reifiedResourceComponent';
import { EditableResourceComponent } from '../resourceView/resViewResources/editableResourceComponent';

import { BroadersPartitionRenderer } from '../resourceView/renderer/impl/broadersPartitionRenderer';
import { ClassAxiomPartitionPartitionRenderer } from '../resourceView/renderer/impl/classAxiomPartitionRenderer';
import { DenotationsPartitionRenderer } from '../resourceView/renderer/impl/denotationsPartitionRenderer';
import { DomainsPartitionRenderer } from '../resourceView/renderer/impl/domainsPartitionRenderer';
import { EvokedLexicalConceptsPartitionRenderer } from '../resourceView/renderer/impl/evokedLexicalConceptsPartitionRenderer';
import { FormBasedPreviewRenderer } from '../resourceView/renderer/impl/formBasedPreviewRenderer';
import { FormRepresentationsPartitionRenderer } from '../resourceView/renderer/impl/formRepresentationsPartitionRenderer';
import { LabelRelationsPartitionRenderer } from '../resourceView/renderer/impl/labelRelationsPartitionRenderer';
import { LexicalizationsPartitionRenderer } from '../resourceView/renderer/impl/lexicalizationsPartitionRenderer';
import { LexicalFormsPartitionRenderer } from '../resourceView/renderer/impl/lexicalFormsPartitionRenderer';
import { LexicalSensesPartitionRenderer } from '../resourceView/renderer/impl/lexicalSensesPartitionRenderer';
import { MembersOrderedPartitionRenderer } from '../resourceView/renderer/impl/membersOrderedPartitionRenderer';
import { MembersPartitionRenderer } from '../resourceView/renderer/impl/membersPartitionRenderer';
import { NotesPartitionRenderer } from '../resourceView/renderer/impl/notesPartitionRenderer';
import { PropertiesPartitionRenderer } from '../resourceView/renderer/impl/propertiesPartitionRenderer';
import { PropertyFacetsPartitionRenderer } from '../resourceView/renderer/impl/propertyFacetsPartitionRenderer';
import { RangesPartitionRenderer } from '../resourceView/renderer/impl/rangesPartitionRenderer';
import { SchemesPartitionRenderer } from '../resourceView/renderer/impl/schemesPartitionRenderer';
import { SubtermsPartitionRenderer } from '../resourceView/renderer/impl/subtermsPartitionRenderer';
import { SuperPropertiesPartitionRenderer } from '../resourceView/renderer/impl/superPropertiesPartitionRenderer';
import { TopConceptsPartitionRenderer } from '../resourceView/renderer/impl/topConceptsPartitionRenderer';
import { TypesPartitionRenderer } from '../resourceView/renderer/impl/typesPartitionRenderer';

import { PredicateObjectsRenderer } from '../resourceView/renderer/predicateObjectsRenderer';

import { ResViewModalServices } from '../resourceView/resViewModals/resViewModalServices';
import { ClassListCreatorModal } from '../resourceView/resViewModals/classListCreatorModal';
import { InstanceListCreatorModal } from '../resourceView/resViewModals/instanceListCreatorModal';
import { AddPropertyValueModal } from '../resourceView/resViewModals/addPropertyValueModal';
import { DataRangeEditorModal } from '../resourceView/resViewModals/dataRangeEditorModal';
import { ResViewSettingsModal } from '../resourceView/resViewModals/resViewSettingsModal';
import { AddManuallyValueModal } from '../resourceView/resViewModals/addManuallyValueModal';
//this is only used in addPropertyValueModal, if it will be usefull somewhere else, move this in sharedModules
import { DataRangeEditor } from '../resourceView/resViewModals/dataRangeEditor';

@NgModule({
    imports: [
        CommonModule, FormsModule,
        SharedModule, TreeAndListModule
    ],
    declarations: [
        ResourceViewComponent, ResourceViewPanelComponent, ResourceViewModal,
        ResourceViewSplittedComponent, ResourceViewTabbedComponent,
        ResourceRenameComponent, ResourceViewContextMenu,
        ReifiedResourceComponent, EditableResourceComponent,
        //renderers
        BroadersPartitionRenderer, ClassAxiomPartitionPartitionRenderer, DomainsPartitionRenderer, DenotationsPartitionRenderer,
        LexicalizationsPartitionRenderer, LexicalFormsPartitionRenderer, LexicalSensesPartitionRenderer, EvokedLexicalConceptsPartitionRenderer,
        MembersOrderedPartitionRenderer, MembersPartitionRenderer, FormBasedPreviewRenderer, FormRepresentationsPartitionRenderer,
        SubtermsPartitionRenderer, PropertiesPartitionRenderer, PropertyFacetsPartitionRenderer, RangesPartitionRenderer,
        SchemesPartitionRenderer, SuperPropertiesPartitionRenderer, TopConceptsPartitionRenderer,
        TypesPartitionRenderer, LabelRelationsPartitionRenderer, NotesPartitionRenderer,
        PredicateObjectsRenderer,
        //modals
        ClassListCreatorModal, InstanceListCreatorModal, AddPropertyValueModal, DataRangeEditorModal,
        DataRangeEditor, ResViewSettingsModal, AddManuallyValueModal
    ],
    exports: [
        ResourceViewPanelComponent, ResourceViewModal, ResourceViewComponent
    ],
    providers: [ResViewModalServices],
    entryComponents: [
        ClassListCreatorModal, InstanceListCreatorModal, AddPropertyValueModal, DataRangeEditorModal, 
        ResourceViewModal, ResViewSettingsModal, AddManuallyValueModal
    ]
})
export class ResourceViewModule { }