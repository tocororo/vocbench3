import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BroadersPartitionRenderer } from '../resourceView/renderer/impl/broadersPartitionRenderer';
import { ClassAxiomPartitionPartitionRenderer } from '../resourceView/renderer/impl/classAxiomPartitionRenderer';
import { DenotationsPartitionRenderer } from '../resourceView/renderer/impl/denotationsPartitionRenderer';
import { DisjointPropertiesPartitionRenderer } from '../resourceView/renderer/impl/disjointPropertiesRenderer';
import { DomainsPartitionRenderer } from '../resourceView/renderer/impl/domainsPartitionRenderer';
import { EquivalentPropertiesPartitionRenderer } from '../resourceView/renderer/impl/equivalentPropertiesPartitionRenderer';
import { EvokedLexicalConceptsPartitionRenderer } from '../resourceView/renderer/impl/evokedLexicalConceptsPartitionRenderer';
import { FormBasedPreviewRenderer } from '../resourceView/renderer/impl/formBasedPreviewRenderer';
import { FormRepresentationsPartitionRenderer } from '../resourceView/renderer/impl/formRepresentationsPartitionRenderer';
import { ImportsPartitionRenderer } from '../resourceView/renderer/impl/importsPartitionRenderer';
import { LabelRelationsPartitionRenderer } from '../resourceView/renderer/impl/labelRelationsPartitionRenderer';
import { LexicalFormsPartitionRenderer } from '../resourceView/renderer/impl/lexicalFormsPartitionRenderer';
import { LexicalSensesPartitionRenderer } from '../resourceView/renderer/impl/lexicalSensesPartitionRenderer';
import { LexicalizationsPartitionRenderer } from '../resourceView/renderer/impl/lexicalizationsPartitionRenderer';
import { MembersOrderedPartitionRenderer } from '../resourceView/renderer/impl/membersOrderedPartitionRenderer';
import { MembersPartitionRenderer } from '../resourceView/renderer/impl/membersPartitionRenderer';
import { NotesPartitionRenderer } from '../resourceView/renderer/impl/notesPartitionRenderer';
import { PropertiesPartitionRenderer } from '../resourceView/renderer/impl/propertiesPartitionRenderer';
import { PropertyChainRenderer } from '../resourceView/renderer/impl/propertyChainRenderer';
import { PropertyFacetsPartitionRenderer } from '../resourceView/renderer/impl/propertyFacetsPartitionRenderer';
import { RangesPartitionRenderer } from '../resourceView/renderer/impl/rangesPartitionRenderer';
import { SchemesPartitionRenderer } from '../resourceView/renderer/impl/schemesPartitionRenderer';
import { SubtermsPartitionRenderer } from '../resourceView/renderer/impl/subtermsPartitionRenderer';
import { SuperPropertiesPartitionRenderer } from '../resourceView/renderer/impl/superPropertiesPartitionRenderer';
import { TopConceptsPartitionRenderer } from '../resourceView/renderer/impl/topConceptsPartitionRenderer';
import { TypesPartitionRenderer } from '../resourceView/renderer/impl/typesPartitionRenderer';
import { PredicateObjectsRenderer } from '../resourceView/renderer/predicateObjectsRenderer';
import { AddManuallyValueModal } from '../resourceView/resViewModals/addManuallyValueModal';
import { AddPropertyValueModal } from '../resourceView/resViewModals/addPropertyValueModal';
import { ClassListCreatorModal } from '../resourceView/resViewModals/classListCreatorModal';
import { DataRangeEditor } from '../resourceView/resViewModals/dataRangeEditor';
import { DataRangeEditorModal } from '../resourceView/resViewModals/dataRangeEditorModal';
import { InstanceListCreatorModal } from '../resourceView/resViewModals/instanceListCreatorModal';
import { PropertyChainCreatorModal } from '../resourceView/resViewModals/propertyChainCreatorModal';
import { ResViewModalServices } from '../resourceView/resViewModals/resViewModalServices';
import { ResViewSettingsModal } from '../resourceView/resViewModals/resViewSettingsModal';
import { EditableResourceComponent } from '../resourceView/resViewResources/editableResourceComponent';
import { ReifiedResourceComponent } from '../resourceView/resViewResources/reifiedResourceComponent';
import { ResourceRenameComponent } from '../resourceView/resourceRenameComponent';
import { ResourceViewComponent } from '../resourceView/resourceViewComponent';
import { ResourceViewContextMenu } from '../resourceView/resourceViewCtxMenu';
import { ResourceViewModal } from '../resourceView/resourceViewModal';
import { ResourceViewPanelComponent } from '../resourceView/resourceViewPanel/resourceViewPanelComponent';
import { ResourceViewSplittedComponent } from '../resourceView/resourceViewPanel/resourceViewSplittedComponent';
import { ResourceViewTabbedComponent } from '../resourceView/resourceViewPanel/resourceViewTabbedComponent';
import { SharedModule } from './sharedModule';
import { TreeAndListModule } from "./treeAndListModule";

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
        BroadersPartitionRenderer,
        ClassAxiomPartitionPartitionRenderer, 
        DenotationsPartitionRenderer,
        DisjointPropertiesPartitionRenderer,
        DomainsPartitionRenderer,
        EquivalentPropertiesPartitionRenderer, 
        EvokedLexicalConceptsPartitionRenderer,
        FormBasedPreviewRenderer,
        FormRepresentationsPartitionRenderer,
        ImportsPartitionRenderer,
        LabelRelationsPartitionRenderer,
        LexicalizationsPartitionRenderer, 
        LexicalFormsPartitionRenderer, 
        LexicalSensesPartitionRenderer,
        MembersOrderedPartitionRenderer,
        MembersPartitionRenderer,
        NotesPartitionRenderer,
        PredicateObjectsRenderer,
        PropertiesPartitionRenderer,
        PropertyChainRenderer,
        PropertyFacetsPartitionRenderer,
        RangesPartitionRenderer,
        SchemesPartitionRenderer,
        SubtermsPartitionRenderer,
        SuperPropertiesPartitionRenderer,
        TopConceptsPartitionRenderer,
        TypesPartitionRenderer,
        //modals
        ClassListCreatorModal, InstanceListCreatorModal, AddPropertyValueModal, DataRangeEditorModal,
        DataRangeEditor, ResViewSettingsModal, AddManuallyValueModal, PropertyChainCreatorModal
    ],
    exports: [
        ResourceViewPanelComponent, ResourceViewModal, ResourceViewComponent
    ],
    providers: [ResViewModalServices],
    entryComponents: [
        ClassListCreatorModal, InstanceListCreatorModal, AddPropertyValueModal, DataRangeEditorModal, 
        ResourceViewModal, ResViewSettingsModal, AddManuallyValueModal, PropertyChainCreatorModal
    ]
})
export class ResourceViewModule { }