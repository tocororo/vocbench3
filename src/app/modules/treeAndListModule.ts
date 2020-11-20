import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { MultiSubjectEnrichmentHelper } from '../structures/multiSubjectEnrichmentHelper';
import { LexicalEntryListComponent } from '../structures/lists/lexicalEntry/lexicalEntryListComponent';
import { LexicalEntryListNodeComponent } from '../structures/lists/lexicalEntry/lexicalEntryListNodeComponent';
import { LexicalEntryListPanelComponent } from '../structures/lists/lexicalEntry/lexicalEntryListPanelComponent';
import { LexicalEntryListSettingsModal } from '../structures/lists/lexicalEntry/lexicalEntryListSettingsModal';
import { LexicalSenseSelectorComponent } from '../structures/trees/class/lexicalSenseSelectorComponent';
import { LexiconListComponent } from '../structures/lists/lexicon/lexiconListComponent';
import { LexiconListNodeComponent } from '../structures/lists/lexicon/lexiconListNodeComponent';
import { LexiconListPanelComponent } from '../structures/lists/lexicon/lexiconListPanelComponent';
import { ClassIndividualTreeComponent } from '../structures/trees/class/classIndividualTreeComponent';
import { ClassIndividualTreePanelComponent } from '../structures/trees/class/classIndividualTreePanelComponent';
import { ClassTreeComponent } from '../structures/trees/class/classTreeComponent';
import { ClassTreeNodeComponent } from '../structures/trees/class/classTreeNodeComponent';
import { ClassTreePanelComponent } from '../structures/trees/class/classTreePanelComponent';
import { ClassTreeSettingsModal } from '../structures/trees/class/classTreeSettingsModal';
import { DatatypeListComponent } from '../structures/lists/datatype/datatypeListComponent';
import { DatatypeListNodeComponent } from '../structures/lists/datatype/datatypeListNodeComponent';
import { DatatypeListPanelComponent } from '../structures/lists/datatype/datatypeListPanelComponent';
import { InstanceListComponent } from '../structures/lists/instance/instanceListComponent';
import { InstanceListNodeComponent } from '../structures/lists/instance/instanceListNodeComponent';
import { InstanceListPanelComponent } from '../structures/lists/instance/instanceListPanelComponent';
import { InstanceListSettingsModal } from '../structures/lists/instance/instanceListSettingsModal';
import { PropertyTreeComponent } from '../structures/trees/property/propertyTreeComponent';
import { PropertyTreeNodeComponent } from '../structures/trees/property/propertyTreeNodeComponent';
import { PropertyTreePanelComponent } from '../structures/trees/property/propertyTreePanelComponent';
import { AdvancedSearchModal } from '../structures/searchBar/advancedSearchModal';
import { CustomSearchModal } from '../structures/searchBar/customSearchModal';
import { LoadCustomSearchModal } from '../structures/searchBar/loadCustomSearchModal';
import { SearchBarComponent } from '../structures/searchBar/searchBarComponent'; //not exported, used just in this module
import { SearchSettingsModal } from '../structures/searchBar/searchSettingsModal';
import { CollectionTreeComponent } from '../structures/trees/collection/collectionTreeComponent';
import { CollectionTreeNodeComponent } from '../structures/trees/collection/collectionTreeNodeComponent';
import { CollectionTreePanelComponent } from '../structures/trees/collection/collectionTreePanelComponent';
import { ConceptTreeComponent } from '../structures/trees/concept/conceptTreeComponent';
import { ConceptTreeNodeComponent } from '../structures/trees/concept/conceptTreeNodeComponent';
import { AddToSchemeModal } from '../structures/trees/concept/addToSchemeModal';
import { ConceptTreePanelComponent } from '../structures/trees/concept/conceptTreePanelComponent';
import { ConceptTreeSettingsModal } from '../structures/trees/concept/conceptTreeSettingsModal';
import { SchemeListComponent } from '../structures/lists/scheme/schemeListComponent';
import { SchemeListNodeComponent } from '../structures/lists/scheme/schemeListNodeComponent';
import { SchemeListPanelComponent } from '../structures/lists/scheme/schemeListPanelComponent';
import { TabsetPanelComponent } from '../structures/tabset/tabsetPanelComponent';
import { TreeListSettingsModal } from '../structures/tabset/treeListSettingsModal';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        AutocompleteLibModule,
        CommonModule, 
        FormsModule, 
        NgbDropdownModule,
        RouterModule, 
        SharedModule, 
    ],
    declarations: [
        AddToSchemeModal,
        AdvancedSearchModal,
        ClassIndividualTreeComponent,
        ClassIndividualTreePanelComponent,
        ClassTreeComponent,
        ClassTreeNodeComponent,
        ClassTreePanelComponent,
        ClassTreeSettingsModal,
        CollectionTreeComponent,
        CollectionTreeNodeComponent,
        CollectionTreePanelComponent,
        ConceptTreeComponent,
        ConceptTreeNodeComponent,
        ConceptTreePanelComponent,
        ConceptTreeSettingsModal,
        CustomSearchModal,
        DatatypeListComponent,
        DatatypeListNodeComponent,
        DatatypeListPanelComponent,
        InstanceListComponent,
        InstanceListNodeComponent,
        InstanceListPanelComponent,
        InstanceListSettingsModal,
        LexicalEntryListComponent,
        LexicalEntryListNodeComponent,
        LexicalEntryListPanelComponent,
        LexicalEntryListSettingsModal,
        LexicalSenseSelectorComponent,
        LexiconListComponent,
        LexiconListNodeComponent,
        LexiconListPanelComponent,
        LoadCustomSearchModal,
        PropertyTreeComponent,
        PropertyTreeNodeComponent,
        PropertyTreePanelComponent,
        SchemeListComponent,
        SchemeListNodeComponent,
        SchemeListPanelComponent,
        SearchBarComponent,
        SearchSettingsModal,
        TabsetPanelComponent,
        TreeListSettingsModal,
    ],
    exports: [
        ClassIndividualTreeComponent,
        ClassIndividualTreePanelComponent,
        ClassTreeComponent,
        ClassTreePanelComponent,
        CollectionTreeComponent,
        CollectionTreePanelComponent,
        ConceptTreeComponent,
        ConceptTreePanelComponent,
        DatatypeListComponent,
        DatatypeListPanelComponent,
        InstanceListComponent,
        InstanceListPanelComponent,
        LexicalEntryListComponent,
        LexicalEntryListPanelComponent,
        LexicalSenseSelectorComponent,
        LexiconListComponent,
        LexiconListPanelComponent,
        PropertyTreeComponent,
        PropertyTreePanelComponent,
        SchemeListComponent,
        SchemeListPanelComponent,
        TabsetPanelComponent,
    ],
    providers: [MultiSubjectEnrichmentHelper],
    entryComponents: [
        AddToSchemeModal,
        AdvancedSearchModal,
        ClassTreeSettingsModal,
        ConceptTreeSettingsModal,
        CustomSearchModal,
        InstanceListSettingsModal,
        LexicalEntryListSettingsModal,
        LoadCustomSearchModal,
        SearchSettingsModal,
        TreeListSettingsModal,
    ]
})
export class TreeAndListModule { }