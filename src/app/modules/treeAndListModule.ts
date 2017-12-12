import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from './sharedModule';

import { TreePanelComponent } from '../trees/treePanelComponent';
import { TreeListSettingsModal } from '../trees/treeListSettingsModal';

import { ConceptTreePanelComponent } from '../trees/skos/concept/conceptTreePanel/conceptTreePanelComponent';
import { ConceptTreeComponent } from '../trees/skos/concept/conceptTree/conceptTreeComponent';
import { ConceptTreeNodeComponent } from '../trees/skos/concept/conceptTree/conceptTreeNodeComponent';

import { CollectionTreePanelComponent } from '../trees/skos/collection/collectionTreePanel/collectionTreePanelComponent';
import { CollectionTreeComponent } from '../trees/skos/collection/collectionTree/collectionTreeComponent';
import { CollectionTreeNodeComponent } from '../trees/skos/collection/collectionTree/collectionTreeNodeComponent';

import { SchemeListPanelComponent } from '../trees/skos/scheme/schemeListPanel/schemeListPanelComponent';
import { SchemeListComponent } from '../trees/skos/scheme/schemeList/schemeListComponent';
import { SchemeListNodeComponent } from '../trees/skos/scheme/schemeList/schemeListNodeComponent';

import { PropertyTreePanelComponent } from '../trees/property/propertyTreePanel/propertyTreePanelComponent';
import { PropertyTreeComponent } from '../trees/property/propertyTree/propertyTreeComponent';
import { PropertyTreeNodeComponent } from '../trees/property/propertyTree/propertyTreeNodeComponent';

import { ClassIndividualTreePanelComponent } from '../trees/owl/classIndividualTreePanel/classIndividualTreePanelComponent';
import { ClassTreePanelComponent } from '../trees/owl/classTreePanel/classTreePanelComponent';
import { ClassTreeComponent } from '../trees/owl/classTree/classTreeComponent';
import { ClassTreeNodeComponent } from '../trees/owl/classTree/classTreeNodeComponent';
import { ClassTreeSettingsModal } from '../trees/owl/classTreePanel/classTreeSettingsModal';

import { ClassIndividualTreeComponent } from '../trees/owl/classIndividualTree/classIndividualTreeComponent';
import { InstanceListPanelComponent } from '../trees/owl/instanceListPanel/instanceListPanelComponent';
import { InstanceListComponent } from '../trees/owl/instanceList/instanceListComponent';
import { InstanceListNodeComponent } from '../trees/owl/instanceList/instanceListNodeComponent';

import { SearchBarComponent } from '../trees/searchBar/searchBarComponent'; //not exported, used just in this module
import { SearchSettingsModal } from '../trees/searchBar/searchSettingsModal';


import { Ng2CompleterModule } from "ng2-completer";

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule, Ng2CompleterModule], 
    declarations: [
        TreePanelComponent, TreeListSettingsModal,
        ConceptTreePanelComponent, ConceptTreeComponent, ConceptTreeNodeComponent,
        CollectionTreePanelComponent, CollectionTreeComponent, CollectionTreeNodeComponent,
        SchemeListPanelComponent, SchemeListComponent, SchemeListNodeComponent,
        ClassIndividualTreePanelComponent, ClassTreePanelComponent, ClassTreeComponent, ClassTreeNodeComponent,
        PropertyTreePanelComponent, PropertyTreeComponent, PropertyTreeNodeComponent,
        ClassIndividualTreeComponent, InstanceListPanelComponent, InstanceListComponent, InstanceListNodeComponent,
        SearchBarComponent, SearchSettingsModal, ClassTreeSettingsModal
    ],
    exports: [
        TreePanelComponent,
        ConceptTreePanelComponent, ConceptTreeComponent,
        CollectionTreePanelComponent, CollectionTreeComponent,
        SchemeListPanelComponent, SchemeListComponent,
        ClassIndividualTreePanelComponent, ClassTreePanelComponent, ClassTreeComponent,
        PropertyTreePanelComponent, PropertyTreeComponent,
        ClassIndividualTreeComponent, InstanceListPanelComponent, InstanceListComponent, InstanceListNodeComponent
    ],
    entryComponents: [SearchSettingsModal, ClassTreeSettingsModal, TreeListSettingsModal]
})
export class TreeAndListModule { }