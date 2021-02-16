import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LexEntryComponent } from '../resourceView/lexicographerView/lexicalEntry/lexEntryComponent';
import { LexicalRelationComponent } from '../resourceView/lexicographerView/lexicalRelation/lexicalRelationComponent';
import { RelatedGroupComponent } from '../resourceView/lexicographerView/lexicalRelation/relatedComponent';
import { TranslatableAsComponent } from '../resourceView/lexicographerView/lexicalRelation/translatableAsComponent';
import { LexicalFormComponent } from '../resourceView/lexicographerView/lexicalForm/lexicalFormComponent';
import { MorphosyntacticPropComponent } from '../resourceView/lexicographerView/lexicalForm/morphosyntacticPropComponent';
import { PhoneticRepComponent } from '../resourceView/lexicographerView/lexicalForm/phoneticRepComponent';
import { ConceptReferenceComponent } from '../resourceView/lexicographerView/lexicalSense/conceptReferenceComponent';
import { LexicalSenseComponent } from '../resourceView/lexicographerView/lexicalSense/lexicalSenseComponent';
import { TranslationComponent } from '../resourceView/lexicographerView/lexicalSense/translationComponent';
import { LexicographerViewComponent } from '../resourceView/lexicographerView/lexicographerViewComponent';
import { ResourceViewTabContainer } from '../resourceView/resourceViewContainer/resourceViewContainer';
import { BroadersPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/broadersPartitionRenderer';
import { ClassAxiomPartitionPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/classAxiomPartitionRenderer';
import { ConstituentsPartitionRenderer } from '../resourceView/resourceViewEditor/renderer/impl/constituentsPartitionRenderer';
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
        ConceptReferenceComponent,
        LexEntryComponent,
        LexicalFormComponent,
        LexicalRelationComponent,
        LexicalSenseComponent,
        LexicographerViewComponent,
        MorphosyntacticPropComponent,
        PhoneticRepComponent,
        RelatedGroupComponent,
        TranslatableAsComponent,
        TranslationComponent,
        //ResourceView
        BroadersPartitionRenderer,
        ClassAxiomPartitionPartitionRenderer, 
        ConstituentsPartitionRenderer,
        CustomFormTableCellComponent,
        CustomFormValueTableComponent,
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
        ResViewSettingsModal
    ],
    exports: [
        ResourceViewEditorComponent,
        ResourceViewModeDispatcher,
    ],
    providers: [
        LexicalizationEnrichmentHelper,
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
        PropertyChainCreatorModal,
        RdfsMembersModal,
        ResourceViewModal,
        ResViewSettingsModal,
    ]
})
export class ResourceViewModule { }