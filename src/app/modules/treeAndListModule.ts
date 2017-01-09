import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {SharedModule} from './sharedModule';

import {TreePanelComponent} from '../trees/treePanelComponent';

import {ConceptTreePanelComponent} from '../trees/skos/concept/conceptTreePanel/conceptTreePanelComponent';
import {ConceptTreeComponent} from '../trees/skos/concept/conceptTree/conceptTreeComponent';
import {ConceptTreeNodeComponent} from '../trees/skos/concept/conceptTree/conceptTreeNodeComponent';

import {CollectionTreePanelComponent} from '../trees/skos/collection/collectionTreePanel/collectionTreePanelComponent';
import {CollectionTreeComponent} from '../trees/skos/collection/collectionTree/collectionTreeComponent';
import {CollectionTreeNodeComponent} from '../trees/skos/collection/collectionTree/collectionTreeNodeComponent';

import {SchemeListPanelComponent} from '../trees/skos/scheme/schemeListPanel/schemeListPanelComponent';
import {SchemeListComponent} from '../trees/skos/scheme/schemeList/schemeListComponent';
import {SchemeListNodeComponent} from '../trees/skos/scheme/schemeList/schemeListNodeComponent';

import {PropertyTreePanelComponent} from '../trees/property/propertyTreePanel/propertyTreePanelComponent';
import {PropertyTreeComponent} from '../trees/property/propertyTree/propertyTreeComponent';
import {PropertyTreeNodeComponent} from '../trees/property/propertyTree/propertyTreeNodeComponent';

import {ClassTreePanelComponent} from '../trees/owl/classTreePanel/classTreePanelComponent';
import {ClassTreeComponent} from '../trees/owl/classTree/classTreeComponent';
import {ClassTreeNodeComponent} from '../trees/owl/classTree/classTreeNodeComponent';

import {ClassIndividualTreeComponent} from '../trees/owl/classIndividualTree/classIndividualTreeComponent';
import {InstanceListComponent} from '../trees/owl/instanceList/instanceListComponent'

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule],
    declarations: [
        TreePanelComponent,
        ConceptTreePanelComponent, ConceptTreeComponent, ConceptTreeNodeComponent, 
        CollectionTreePanelComponent, CollectionTreeComponent, CollectionTreeNodeComponent,
        SchemeListPanelComponent, SchemeListComponent, SchemeListNodeComponent,
        ClassTreePanelComponent, ClassTreeComponent, ClassTreeNodeComponent,
        PropertyTreePanelComponent, PropertyTreeComponent, PropertyTreeNodeComponent,
        ClassIndividualTreeComponent, InstanceListComponent,
    ],
    exports: [
        TreePanelComponent,
        ConceptTreePanelComponent, ConceptTreeComponent,
        CollectionTreePanelComponent, CollectionTreeComponent,
        SchemeListPanelComponent, SchemeListComponent,
        ClassTreePanelComponent, ClassTreeComponent,
        PropertyTreePanelComponent, PropertyTreeComponent,
        ClassIndividualTreeComponent, InstanceListComponent,
    ]
})
export class TreeAndListModule { }