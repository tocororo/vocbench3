import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule} from './sharedModule';
import {TreeAndListModule} from "./treeAndListModule";

import {ResourceViewComponent} from '../resourceView/resourceViewComponent';
import {ResourceRenameComponent} from '../resourceView/resourceRenameComponent';
import {ResourceViewPanelComponent} from '../resourceView/resourceViewPanel/resourceViewPanelComponent';
import {ResourceViewSplittedComponent} from '../resourceView/resourceViewPanel/resourceViewSplittedComponent';
import {ResourceViewTabbedComponent} from '../resourceView/resourceViewPanel/resourceViewTabbedComponent';
import {ReifiedResourceComponent} from '../resourceView/reifiedResource/reifiedResourceComponent';

import {BroadersPartitionRenderer} from '../resourceView/renderer/broadersPartitionRenderer';
import {ClassAxiomPartitionPartitionRenderer} from '../resourceView/renderer/classAxiomPartitionRenderer';
import {DomainsPartitionRenderer} from '../resourceView/renderer/domainsPartitionRenderer';
import {LexicalizationsPartitionRenderer} from '../resourceView/renderer/lexicalizationsPartitionRenderer';
import {MembersOrderedPartitionRenderer} from '../resourceView/renderer/membersOrderedPartitionRenderer';
import {MembersPartitionRenderer} from '../resourceView/renderer/membersPartitionRenderer';
import {PropertiesPartitionRenderer} from '../resourceView/renderer/propertiesPartitionRenderer';
import {PropertyFacetsPartitionRenderer} from '../resourceView/renderer/propertyFacetsPartitionRenderer';
import {RangesPartitionRenderer} from '../resourceView/renderer/rangesPartitionRenderer';
import {SchemesPartitionRenderer} from '../resourceView/renderer/schemesPartitionRenderer';
import {SuperPropertiesPartitionRenderer} from '../resourceView/renderer/superPropertiesPartitionRenderer';
import {TopConceptsPartitionRenderer} from '../resourceView/renderer/topConceptsPartitionRenderer';
import {TypesPartitionRenderer} from '../resourceView/renderer/typesPartitionRenderer';

import {ResViewModalServices} from '../resourceView/resViewModals/resViewModalServices';
import {ClassListCreatorModal} from '../resourceView/resViewModals/classListCreatorModal';
import {EnrichPropertyModal} from '../resourceView/resViewModals/enrichPropertyModal';
import {InstanceListCreatorModal} from '../resourceView/resViewModals/instanceListCreatorModal';

@NgModule({
    imports: [
        CommonModule, FormsModule,
        SharedModule, TreeAndListModule
    ],
    declarations: [
        ResourceViewComponent, ResourceViewPanelComponent,
        ResourceViewSplittedComponent, ResourceViewTabbedComponent,
        ResourceRenameComponent, ReifiedResourceComponent,
        //renderers
        BroadersPartitionRenderer, ClassAxiomPartitionPartitionRenderer, DomainsPartitionRenderer,
        LexicalizationsPartitionRenderer, MembersOrderedPartitionRenderer, MembersPartitionRenderer,
        PropertiesPartitionRenderer, PropertyFacetsPartitionRenderer, RangesPartitionRenderer,
        SchemesPartitionRenderer, SuperPropertiesPartitionRenderer, TopConceptsPartitionRenderer,
        TypesPartitionRenderer,
        //modals
        ClassListCreatorModal, EnrichPropertyModal, InstanceListCreatorModal
    ],
    exports: [
        ResourceViewPanelComponent
    ],
    providers: [ResViewModalServices],
    entryComponents: [
        ClassListCreatorModal, EnrichPropertyModal, InstanceListCreatorModal
    ]
})
export class ResourceViewModule { }