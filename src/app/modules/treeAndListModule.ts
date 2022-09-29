import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { DatatypeListComponent } from '../structures/lists/datatype/datatypeListComponent';
import { DatatypeListNodeComponent } from '../structures/lists/datatype/datatypeListNodeComponent';
import { DatatypeListPanelComponent } from '../structures/lists/datatype/datatypeListPanelComponent';
import { InstanceListComponent } from '../structures/lists/instance/instanceListComponent';
import { InstanceListNodeComponent } from '../structures/lists/instance/instanceListNodeComponent';
import { InstanceListPanelComponent } from '../structures/lists/instance/instanceListPanelComponent';
import { InstanceListSettingsModal } from '../structures/lists/instance/instanceListSettingsModal';
import { LexicalEntryListComponent } from '../structures/lists/lexicalEntry/lexicalEntryListComponent';
import { LexicalEntryListNodeComponent } from '../structures/lists/lexicalEntry/lexicalEntryListNodeComponent';
import { LexicalEntryListPanelComponent } from '../structures/lists/lexicalEntry/lexicalEntryListPanelComponent';
import { LexicalEntryListSettingsModal } from '../structures/lists/lexicalEntry/lexicalEntryListSettingsModal';
import { LexiconListComponent } from '../structures/lists/lexicon/lexiconListComponent';
import { LexiconListNodeComponent } from '../structures/lists/lexicon/lexiconListNodeComponent';
import { LexiconListPanelComponent } from '../structures/lists/lexicon/lexiconListPanelComponent';
import { SchemeListComponent } from '../structures/lists/scheme/schemeListComponent';
import { SchemeListNodeComponent } from '../structures/lists/scheme/schemeListNodeComponent';
import { SchemeListPanelComponent } from '../structures/lists/scheme/schemeListPanelComponent';
import { TranslationSetListComponent } from '../structures/lists/translationSet/translationSetListComponent';
import { TranslationSetListNodeComponent } from '../structures/lists/translationSet/translationSetListNodeComponent';
import { TranslationSetListPanelComponent } from '../structures/lists/translationSet/translationSetListPanelComponent';
import { MultiSubjectEnrichmentHelper } from '../structures/multiSubjectEnrichmentHelper';
import { AdvancedSearchModal } from '../structures/searchBar/advancedSearchModal';
import { CustomSearchModal } from '../structures/searchBar/customSearchModal';
import { LoadCustomSearchModal } from '../structures/searchBar/loadCustomSearchModal';
import { SearchBarComponent } from '../structures/searchBar/searchBarComponent'; //not exported, used just in this module
import { SearchSettingsModal } from '../structures/searchBar/searchSettingsModal';
import { TabsetPanelComponent } from '../structures/tabset/tabsetPanelComponent';
import { TreeListSettingsModal } from '../structures/tabset/treeListSettingsModal';
import { ClassIndividualTreeComponent } from '../structures/trees/class/classIndividualTreeComponent';
import { ClassIndividualTreePanelComponent } from '../structures/trees/class/classIndividualTreePanelComponent';
import { ClassTreeComponent } from '../structures/trees/class/classTreeComponent';
import { ClassTreeNodeComponent } from '../structures/trees/class/classTreeNodeComponent';
import { ClassTreePanelComponent } from '../structures/trees/class/classTreePanelComponent';
import { ClassTreeSettingsModal } from '../structures/trees/class/classTreeSettingsModal';
import { LexicalSenseSelectorComponent } from '../structures/trees/class/lexicalSenseSelectorComponent';
import { CollectionTreeComponent } from '../structures/trees/collection/collectionTreeComponent';
import { CollectionTreeNodeComponent } from '../structures/trees/collection/collectionTreeNodeComponent';
import { CollectionTreePanelComponent } from '../structures/trees/collection/collectionTreePanelComponent';
import { AddToSchemeModal } from '../structures/trees/concept/addToSchemeModal';
import { ConceptTreeComponent } from '../structures/trees/concept/conceptTreeComponent';
import { ConceptTreeNodeComponent } from '../structures/trees/concept/conceptTreeNodeComponent';
import { ConceptTreePanelComponent } from '../structures/trees/concept/conceptTreePanelComponent';
import { ConceptTreeSettingsModal } from '../structures/trees/concept/conceptTreeSettingsModal';
import { CustomTreeComponent } from '../structures/trees/custom/customTreeComponent';
import { CustomTreeNodeComponent } from '../structures/trees/custom/customTreeNodeComponent';
import { CustomTreePanelComponent } from '../structures/trees/custom/customTreePanelComponent';
import { CustomTreeSettingsComponent } from '../structures/trees/custom/customTreeSettingsComponent';
import { PropertyTreeComponent } from '../structures/trees/property/propertyTreeComponent';
import { PropertyTreeNodeComponent } from '../structures/trees/property/propertyTreeNodeComponent';
import { PropertyTreePanelComponent } from '../structures/trees/property/propertyTreePanelComponent';
import { LexicalSenseListModal } from '../widget/modal/browsingModal/lexicalSenseListModal/lexicalSenseListModal';
import { TranslationSetModal } from '../widget/modal/browsingModal/translationSetModal/translationSetModal';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        AutocompleteLibModule,
        CommonModule,
        DragDropModule,
        FormsModule, 
        NgbDropdownModule,
        RouterModule, 
        SharedModule,
        TranslateModule
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
        CustomTreeComponent,
        CustomTreeNodeComponent,
        CustomTreePanelComponent,
        CustomTreeSettingsComponent,
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
        LexicalSenseListModal,
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
        TranslationSetListComponent,
        TranslationSetListNodeComponent,
        TranslationSetListPanelComponent,
        TranslationSetModal,
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
        CustomTreeSettingsComponent,
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
        TranslationSetListPanelComponent,
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
        LexicalSenseListModal,
        LoadCustomSearchModal,
        SearchSettingsModal,
        TranslationSetModal,
        TreeListSettingsModal,
    ]
})
export class TreeAndListModule { }