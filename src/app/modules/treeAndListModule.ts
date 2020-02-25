import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Ng2CompleterModule } from "ng2-completer";
import { MultiSubjectEnrichmentHelper } from '../trees/multiSubjectEnrichmentHelper';
import { LexicalEntryListComponent } from '../trees/ontolex/lexicalEntry/lexicalEntryList/lexicalEntryListComponent';
import { LexicalEntryListNodeComponent } from '../trees/ontolex/lexicalEntry/lexicalEntryList/lexicalEntryListNodeComponent';
import { LexicalEntryListPanelComponent } from '../trees/ontolex/lexicalEntry/lexicalEntryListPanel/lexicalEntryListPanelComponent';
import { LexicalEntryListSettingsModal } from '../trees/ontolex/lexicalEntry/lexicalEntryListPanel/lexicalEntryListSettingsModal';
import { LexicalSenseSelectorComponent } from '../trees/ontolex/lexicalSenseSelector/lexicalSenseSelectorComponent';
import { LexiconListComponent } from '../trees/ontolex/lexicon/lexiconList/lexiconListComponent';
import { LexiconListNodeComponent } from '../trees/ontolex/lexicon/lexiconList/lexiconListNodeComponent';
import { LexiconListPanelComponent } from '../trees/ontolex/lexicon/lexiconListPanel/lexiconListPanelComponent';
import { ClassIndividualTreeComponent } from '../trees/owl/classIndividualTree/classIndividualTreeComponent';
import { ClassIndividualTreePanelComponent } from '../trees/owl/classIndividualTreePanel/classIndividualTreePanelComponent';
import { ClassTreeComponent } from '../trees/owl/classTree/classTreeComponent';
import { ClassTreeNodeComponent } from '../trees/owl/classTree/classTreeNodeComponent';
import { ClassTreePanelComponent } from '../trees/owl/classTreePanel/classTreePanelComponent';
import { ClassTreeSettingsModal } from '../trees/owl/classTreePanel/classTreeSettingsModal';
import { DatatypeListComponent } from '../trees/owl/datatypeList/datatypeListComponent';
import { DatatypeListNodeComponent } from '../trees/owl/datatypeList/datatypeListNodeComponent';
import { DatatypeListPanelComponent } from '../trees/owl/datatypeListPanel/datatypeListPanelComponent';
import { InstanceListComponent } from '../trees/owl/instanceList/instanceListComponent';
import { InstanceListNodeComponent } from '../trees/owl/instanceList/instanceListNodeComponent';
import { InstanceListPanelComponent } from '../trees/owl/instanceListPanel/instanceListPanelComponent';
import { PropertyTreeComponent } from '../trees/property/propertyTree/propertyTreeComponent';
import { PropertyTreeNodeComponent } from '../trees/property/propertyTree/propertyTreeNodeComponent';
import { PropertyTreePanelComponent } from '../trees/property/propertyTreePanel/propertyTreePanelComponent';
import { AdvancedSearchModal } from '../trees/searchBar/advancedSearchModal';
import { CustomSearchModal } from '../trees/searchBar/customSearchModal';
import { LoadCustomSearchModal } from '../trees/searchBar/loadCustomSearchModal';
import { SearchBarComponent } from '../trees/searchBar/searchBarComponent'; //not exported, used just in this module
import { SearchSettingsModal } from '../trees/searchBar/searchSettingsModal';
import { CollectionTreeComponent } from '../trees/skos/collection/collectionTree/collectionTreeComponent';
import { CollectionTreeNodeComponent } from '../trees/skos/collection/collectionTree/collectionTreeNodeComponent';
import { CollectionTreePanelComponent } from '../trees/skos/collection/collectionTreePanel/collectionTreePanelComponent';
import { ConceptTreeComponent } from '../trees/skos/concept/conceptTree/conceptTreeComponent';
import { ConceptTreeNodeComponent } from '../trees/skos/concept/conceptTree/conceptTreeNodeComponent';
import { AddToSchemeModal } from '../trees/skos/concept/conceptTreePanel/addToSchemeModal';
import { ConceptTreePanelComponent } from '../trees/skos/concept/conceptTreePanel/conceptTreePanelComponent';
import { ConceptTreeSettingsModal } from '../trees/skos/concept/conceptTreePanel/conceptTreeSettingsModal';
import { SchemeListComponent } from '../trees/skos/scheme/schemeList/schemeListComponent';
import { SchemeListNodeComponent } from '../trees/skos/scheme/schemeList/schemeListNodeComponent';
import { SchemeListPanelComponent } from '../trees/skos/scheme/schemeListPanel/schemeListPanelComponent';
import { TreeListSettingsModal } from '../trees/tabset/treeListSettingsModal';
import { TabsetPanelComponent } from '../trees/tabset/tabsetPanelComponent';
import { SharedModule } from './sharedModule';
import { InstanceListSettingsModal } from '../trees/owl/instanceListPanel/instanceListSettingsModal';

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule, Ng2CompleterModule],
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