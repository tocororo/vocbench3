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
import { BroadersPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/broadersPartitionRenderer';
import { ClassAxiomPartitionPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/classAxiomPartitionRenderer';
import { ConstituentsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/constituentsPartitionRenderer';
import { CustomPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/customPartitionRenderer';
import { DatatypeDefinitionPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/datatypeDefinitionPartitionRenderer';
import { DenotationsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/denotationsPartitionRenderer';
import { DisjointPropertiesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/disjointPropertiesRenderer';
import { DomainsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/domainsPartitionRenderer';
import { EquivalentPropertiesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/equivalentPropertiesPartitionRenderer';
import { EvokedLexicalConceptsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/evokedLexicalConceptsPartitionRenderer';
import { FormBasedPreviewRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/formBasedPreviewRenderer';
import { FormRepresentationsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/formRepresentationsPartitionRenderer';
import { ImportsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/importsPartitionRenderer';
import { LabelRelationsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/labelRelationsPartitionRenderer';
import { LexicalFormsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/lexicalFormsPartitionRenderer';
import { LexicalizationsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/lexicalizationsPartitionRenderer';
import { LexicalSensesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/lexicalSensesPartitionRenderer';
import { MembersOrderedPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/membersOrderedPartitionRenderer';
import { MembersPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/membersPartitionRenderer';
import { NotesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/notesPartitionRenderer';
import { PropertiesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/propertiesPartitionRenderer';
import { PropertyChainRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/propertyChainRenderer';
import { PropertyFacetsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/propertyFacetsPartitionRenderer';
import { RangesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/rangesPartitionRenderer';
import { RdfsMembersPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/rdfsMembersPartitionRenderer';
import { SchemesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/schemesPartitionRenderer';
import { SubtermsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/subtermsPartitionRenderer';
import { SuperPropertiesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/superPropertiesPartitionRenderer';
import { TopConceptsPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/topConceptsPartitionRenderer';
import { TypesPartitionRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/impl/typesPartitionRenderer';
import { LexicalizationEnrichmentHelper } from '../resourceView/resourceViewEditor/partitionRenderer/lexicalizationEnrichmentHelper';
import { PredicateObjectsRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/predicateObjectsRenderer';
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
import { TimeMachineModal } from '../resourceView/resourceViewEditor/timeMachine/timeMachineModal';
import { CustomFormTableCellComponent } from '../resourceView/resourceViewEditor/valueRenderer/cfValueTablePreview/customFormTableCellComponent';
import { CustomFormValueTableComponent } from '../resourceView/resourceViewEditor/valueRenderer/cfValueTablePreview/customFormValueTableComponent';
import { EditableResourceComponent } from '../resourceView/resourceViewEditor/valueRenderer/editableResourceComponent';
import { ReifiedResourceComponent } from '../resourceView/resourceViewEditor/valueRenderer/reifiedResourceComponent';
import { ResourceViewValueRenderer } from '../resourceView/resourceViewEditor/valueRenderer/resourceViewValueRenderer';
import { ChartsRendererComponent } from '../resourceView/resourceViewEditor/valueRenderer/cvRenderer/chartsRendererComponent';
import { MapRendererComponent } from '../resourceView/resourceViewEditor/valueRenderer/cvRenderer/mapRendererComponent';
import { CustomViewRenderer } from '../resourceView/resourceViewEditor/valueRenderer/cvRenderer/customViewRenderer';
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
import { PredicateCustomViewsRenderer } from '../resourceView/resourceViewEditor/partitionRenderer/predicateCustomViewRenderer';

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
        PredicateCustomViewsRenderer,
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
        TimeMachineModal,

        CustomViewRenderer,
        ChartsRendererComponent,
        MapRendererComponent
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