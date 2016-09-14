import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule} from './sharedModule';
import {TreeAndListModule} from "./treeAndListModule";

import {IcvListComponent} from "../icv/icvListComponent";
import {DanglingConceptComponent} from "../icv/danglingConcept/danglingConceptComponent";
import {NoSchemeConceptComponent} from "../icv/noSchemeConcept/noSchemeConceptComponent";
import {NoTopConceptSchemeComponent} from "../icv/noTopConceptScheme/noTopConceptSchemeComponent";
import {TopConceptWithBroaderComponent} from "../icv/topConceptWithBroader/topConceptWithBroaderComponent";
import {HierarchicalRedundancyComponent} from "../icv/hierarchicalRedundancy/hierarchicalRedundancyComponent";
import {NoLabelResourceComponent} from "../icv/noLabelResource/noLabelResourceComponent";
import {OnlyAltLabelResourceComponent} from "../icv/onlyAltLabelResource/onlyAltLabelResourceComponent";
import {OverlappedLabelComponent} from "../icv/overlappedLabel/overlappedLabelComponent";
import {NoLangLabelComponent} from "../icv/noLangLabel/noLangLabelComponent";
import {DanglingXLabelComponent} from "../icv/danglingXLabel/danglingXLabelComponent";

import {icvRouting} from "../icv/icvRoutes";

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, TreeAndListModule, icvRouting],
    declarations: [
        IcvListComponent,
        DanglingConceptComponent, NoSchemeConceptComponent, NoTopConceptSchemeComponent, TopConceptWithBroaderComponent, 
        HierarchicalRedundancyComponent, NoLabelResourceComponent, OnlyAltLabelResourceComponent, OverlappedLabelComponent,
        NoLangLabelComponent, DanglingXLabelComponent,
    ],
    exports: [],
    providers: []
})
export class ICVModule { }