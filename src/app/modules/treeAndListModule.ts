import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {SharedModule} from './sharedModule';

import {ConceptTreePanelComponent} from '../skos/concept/conceptTreePanel/conceptTreePanelComponent';
import {ConceptTreeComponent} from '../skos/concept/conceptTree/conceptTreeComponent';
import {ConceptTreeNodeComponent} from '../skos/concept/conceptTree/conceptTreeNodeComponent';

import {CollectionTreePanelComponent} from '../skos/collection/collectionTreePanel/collectionTreePanelComponent';
import {CollectionTreeComponent} from '../skos/collection/collectionTree/collectionTreeComponent';
import {CollectionTreeNodeComponent} from '../skos/collection/collectionTree/collectionTreeNodeComponent';

import {SchemeListPanelComponent} from '../skos/scheme/schemeListPanel/schemeListPanelComponent';
import {SchemeListComponent} from '../skos/scheme/schemeList/schemeListComponent';
import {SchemeListNodeComponent} from '../skos/scheme/schemeList/schemeListNodeComponent';

import {PropertyTreePanelComponent} from '../property/propertyTreePanel/propertyTreePanelComponent';
import {PropertyTreeComponent} from '../property/propertyTree/propertyTreeComponent';
import {PropertyTreeNodeComponent} from '../property/propertyTree/propertyTreeNodeComponent';

import {ClassTreePanelComponent} from '../owl/classTreePanel/classTreePanelComponent';
import {ClassTreeComponent} from '../owl/classTree/classTreeComponent';
import {ClassTreeNodeComponent} from '../owl/classTree/classTreeNodeComponent';

import {ClassIndividualTreeComponent} from '../owl/classIndividualTree/classIndividualTreeComponent';
import {InstanceListComponent} from '../owl/instanceList/instanceListComponent';

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule],
    declarations: [
        ConceptTreePanelComponent, ConceptTreeComponent, ConceptTreeNodeComponent, 
        CollectionTreePanelComponent, CollectionTreeComponent, CollectionTreeNodeComponent,
        SchemeListPanelComponent, SchemeListComponent, SchemeListNodeComponent,
        ClassTreePanelComponent, ClassTreeComponent, ClassTreeNodeComponent,
        PropertyTreePanelComponent, PropertyTreeComponent, PropertyTreeNodeComponent,
        ClassIndividualTreeComponent, InstanceListComponent,
    ],
    exports: [
        ConceptTreePanelComponent, ConceptTreeComponent,
        CollectionTreePanelComponent, CollectionTreeComponent,
        SchemeListPanelComponent, SchemeListComponent,
        ClassTreePanelComponent, ClassTreeComponent,
        PropertyTreePanelComponent, PropertyTreeComponent,
        ClassIndividualTreeComponent, InstanceListComponent,
    ]
})
export class TreeAndListModule { }