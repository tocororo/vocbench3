import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ConstituentComponent } from '../resourceView/lexicographerView/constituents/constituentComponent';
import { constituentFeatureRenderer } from '../resourceView/lexicographerView/constituents/constituentFeatureRenderer';
import { ConstituentListComponent } from '../resourceView/lexicographerView/constituents/constituentListComponent';
import { LexEntryComponent } from '../resourceView/lexicographerView/lexicalEntry/lexEntryComponent';
import { LexicalFormComponent } from '../resourceView/lexicographerView/lexicalForm/lexicalFormComponent';
import { MorphosyntacticPropComponent } from '../resourceView/lexicographerView/lexicalForm/morphosyntacticPropComponent';
import { PhoneticRepComponent } from '../resourceView/lexicographerView/lexicalForm/phoneticRepComponent';
import { CategoryComponent } from '../resourceView/lexicographerView/lexicalRelation/categoryComponent';
import { EntryRelationComponent } from '../resourceView/lexicographerView/lexicalRelation/entryRelationComponent';
import { LexicalRelationModal } from '../resourceView/lexicographerView/lexicalRelation/lexicalRelationModal';
import { SenseRelationComponent } from '../resourceView/lexicographerView/lexicalRelation/senseRelationComponent';
import { ConceptReferenceComponent } from '../resourceView/lexicographerView/lexicalSense/conceptReferenceComponent';
import { InlineDefinitionComponent } from '../resourceView/lexicographerView/lexicalSense/inlineDefinitionComponent';
import { LexicalSenseComponent } from '../resourceView/lexicographerView/lexicalSense/lexicalSenseComponent';
import { SenseReferenceComponent } from '../resourceView/lexicographerView/lexicalSense/senseReferenceComponent';
import { LexicographerViewComponent } from '../resourceView/lexicographerView/lexicographerViewComponent';
import { LexViewHelper } from '../resourceView/lexicographerView/LexViewHelper';
import { LexViewModalService } from '../resourceView/lexicographerView/lexViewModalService';
import { EntryReferenceComponent } from '../resourceView/lexicographerView/subterms/entryReferenceComponent';
import { SubtermComponent } from '../resourceView/lexicographerView/subterms/subtermComponent';
import { ResourceViewTabContainer } from '../resourceView/resourceViewContainer/resourceViewContainer';
import { BroadersPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/broadersPartitionRenderer';
import { ClassAxiomPartitionPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/classAxiomPartitionRenderer';
import { ConstituentsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/constituentsPartitionRenderer';
import { CustomPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/customPartitionRenderer';
import { DatatypeDefinitionPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/datatypeDefinitionPartitionRenderer';
import { DenotationsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/denotationsPartitionRenderer';
import { DisjointPropertiesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/disjointPropertiesRenderer';
import { DomainsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/domainsPartitionRenderer';
import { EquivalentPropertiesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/equivalentPropertiesPartitionRenderer';
import { EvokedLexicalConceptsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/evokedLexicalConceptsPartitionRenderer';
import { FormBasedPreviewRenderer } from '../resourceView/resourceViewEditor/renderer/impl/formBasedPreviewRenderer';
import { FormRepresentationsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/formRepresentationsPartitionRenderer';
import { ImportsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/importsPartitionRenderer';
import { LabelRelationsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/labelRelationsPartitionRenderer';
import { LexicalFormsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/lexicalFormsPartitionRenderer';
import { LexicalizationsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/lexicalizationsPartitionRenderer';
import { LexicalSensesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/lexicalSensesPartitionRenderer';
import { MembersOrderedPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/membersOrderedPartitionRenderer';
import { MembersPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/membersPartitionRenderer';
import { NotesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/notesPartitionRenderer';
import { PropertiesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/propertiesPartitionRenderer';
import { PropertyChainRenderer } from '../resourceView/resourceViewEditor/renderer/impl/propertyChainRenderer';
import { PropertyFacetsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/propertyFacetsPartitionRenderer';
import { RangesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/rangesPartitionRenderer';
import { RdfsMembersPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/rdfsMembersPartitionRenderer';
import { SchemesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/schemesPartitionRenderer';
import { SubtermsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/subtermsPartitionRenderer';
import { SuperPropertiesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/superPropertiesPartitionRenderer';
import { TopConceptsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/topConceptsPartitionRenderer';
import { TypesPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/typesPartitionRenderer';
import { LexicalizationEnrichmentHelper } from '../resourceView/resourceViewEditor/renderer/lexicalizationEnrichmentHelper';
import { PredicateObjectsRenderer } from '../resourceView/resourceViewEditor/renderer/predicateObjectsRenderer';
import { ResourceRenameComponent } from '../resourceView/resourceViewEditor/resourceRenameComponent';
import { ResourceViewContextMenu } from '../resourceView/resourceViewEditor/resourceViewCtxMenu';
import { ResourceViewEditorComponent } from '../resourceView/resourceViewEditor/resourceViewEditorComponent';
import { AddManuallyValueModal } from '../resourceView/resourceViewEditor/resViewModals/addManuallyValueModal';
import { AddPropertyValueModal } from '../resourceView/resourceViewEditor/resViewModals/addPropertyValueModal';
import { BrowseExternalResourceModal } from '../resourceView/resourceViewEditor/resViewModals/browseExternalResourceModal';
import { ClassListCreatorModal } from '../resourceView/resourceViewEditor/resViewModals/classListCreatorModal';
import { ConstituentListCreatorModal } from '../resourceView/resourceViewEditor/resViewModals/constituentListCreatorModal';
import { CopyLocalesModal } from '../resourceView/resourceViewEditor/resViewModals/copyLocalesModal';
import { DataRangeEditor } from '../resourceView/resourceViewEditor/resViewModals/dataRangeEditor';
import { DataRangeEditorModal } from '../resourceView/resourceViewEditor/resViewModals/dataRangeEditorModal';
import { DatatypeFacetsEditor } from '../resourceView/resourceViewEditor/resViewModals/datatypeFacetsEditor';
import { DataTypeRestrictionsModal } from '../resourceView/resourceViewEditor/resViewModals/datatypeRestrictionsModal';
import { InstanceListCreatorModal } from '../resourceView/resourceViewEditor/resViewModals/instanceListCreatorModal';
import { PropertyChainCreatorModal } from '../resourceView/resourceViewEditor/resViewModals/propertyChainCreatorModal';
import { RdfsMembersModal } from '../resourceView/resourceViewEditor/resViewModals/rdfsMembersModal';
import { ResViewModalServices } from '../resourceView/resourceViewEditor/resViewModals/resViewModalServices';
import { CustomFormTableCellComponent } from '../resourceView/resourceViewEditor/resViewResources/cfValueTablePreview/customFormTableCellComponent';
import { CustomFormValueTableComponent } from '../resourceView/resourceViewEditor/resViewResources/cfValueTablePreview/customFormValueTableComponent';
import { EditableResourceComponent } from '../resourceView/resourceViewEditor/resViewResources/editableResourceComponent';
import { ReifiedResourceComponent } from '../resourceView/resourceViewEditor/resViewResources/reifiedResourceComponent';
import { ResourceViewValueRenderer } from '../resourceView/resourceViewEditor/resViewResources/resourceViewValueRenderer';
import { TimeMachineModal } from '../resourceView/resourceViewEditor/timeMachine/timeMachineModal';
import { ResourceViewModal } from '../resourceView/resourceViewModal';
import { ResourceViewModeDispatcher } from '../resourceView/resourceViewModes/resourceViewModeDispatcher';
import { ResourceViewSplittedComponent } from '../resourceView/resourceViewModes/resourceViewSplittedComponent';
import { ResourceViewTabbedComponent } from '../resourceView/resourceViewModes/resourceViewTabbedComponent';
import { ResViewSettingsModal } from '../resourceView/resViewSettingsModal';
import { LanguageBoxComponent } from '../resourceView/termView/languageBox/languageBoxComponent';
import { LanguageDefinitionComponent } from '../resourceView/termView/languageDefinition/languageDefinition';
import { LanguageTermComponent } from '../resourceView/termView/languageTerm/languageTerm';
import { TermViewComponent } from '../resourceView/termView/termViewComponent';
import { ResourceTripleEditorComponent } from '../resourceView/tripleEditor/resourceTripleEditorComponent';
import { PreferencesModule } from './preferencesModule';
import { SharedModule } from './sharedModule';
import { TreeAndListModule } from "./treeAndListModule";

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        PreferencesModule,
        SharedModule, 
        TranslateModule,
        TreeAndListModule, 
    ],
    declarations: [
        //CodeView
        ResourceTripleEditorComponent,
        //LexView
        CategoryComponent,
        ConceptReferenceComponent,
        ConstituentComponent,
        constituentFeatureRenderer,
        ConstituentListComponent,
        EntryReferenceComponent,
        EntryRelationComponent,
        InlineDefinitionComponent,
        LexEntryComponent,
        LexicalFormComponent,
        LexicalSenseComponent,
        LexicographerViewComponent,
        LexicalRelationModal,
        MorphosyntacticPropComponent,
        PhoneticRepComponent,
        SenseReferenceComponent,
        SenseRelationComponent,
        SubtermComponent,
        //ResourceView
        BroadersPartitionRenderer,
        ClassAxiomPartitionPartitionRenderer, 
        ConstituentsPartitionRenderer,
        CustomFormTableCellComponent,
        CustomFormValueTableComponent,
        CustomPartitionRenderer,
        DatatypeDefinitionPartitionRenderer,
        DenotationsPartitionRenderer,
        DisjointPropertiesPartitionRenderer,
        DomainsPartitionRenderer,
        EditableResourceComponent,
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
        RdfsMembersPartitionRenderer,
        ReifiedResourceComponent,
        ResourceRenameComponent,
        ResourceViewEditorComponent, 
        ResourceViewContextMenu,
        ResourceViewModal,
        ResourceViewValueRenderer,
        SchemesPartitionRenderer,
        SubtermsPartitionRenderer,
        SuperPropertiesPartitionRenderer,
        TopConceptsPartitionRenderer,
        TypesPartitionRenderer,
        //TermView
        LanguageBoxComponent,
        LanguageDefinitionComponent,
        LanguageTermComponent,
        TermViewComponent,

        //misc
        ResourceViewModeDispatcher, 
        ResourceViewSplittedComponent,
        ResourceViewTabbedComponent,
        ResourceViewTabContainer,
        
        //modals
        AddManuallyValueModal,
        AddPropertyValueModal,
        BrowseExternalResourceModal,
        ClassListCreatorModal,
        ConstituentListCreatorModal,
        CopyLocalesModal,
        DataRangeEditorModal,
        DataRangeEditor,
        DataTypeRestrictionsModal,
        DatatypeFacetsEditor,
        InstanceListCreatorModal,
        PropertyChainCreatorModal,
        RdfsMembersModal,
        ResViewSettingsModal,
        TimeMachineModal
    ],
    exports: [
        ResourceViewEditorComponent,
        ResourceViewModeDispatcher,
    ],
    providers: [
        LexicalizationEnrichmentHelper,
        LexViewHelper,
        LexViewModalService,
        ResViewModalServices,
    ],
    entryComponents: [
        AddManuallyValueModal,
        AddPropertyValueModal,
        BrowseExternalResourceModal,
        DataTypeRestrictionsModal,
        ClassListCreatorModal,
        ConstituentListCreatorModal,
        CopyLocalesModal,
        DataRangeEditorModal,
        DataRangeEditor,
        InstanceListCreatorModal,
        LexicalRelationModal,
        PropertyChainCreatorModal,
        RdfsMembersModal,
        ResourceViewModal,
        ResViewSettingsModal,
        TimeMachineModal
    ]
})
export class ResourceViewModule { }