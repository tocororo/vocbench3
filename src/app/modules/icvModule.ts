import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from './sharedModule';
import { TreeAndListModule } from "./treeAndListModule";

import { IcvComponent } from "../icv/icvComponent";
import { IcvListComponent } from "../icv/icvListComponent";
import { DanglingConceptComponent } from "../icv/danglingConcept/danglingConceptComponent";
import { NoSchemeConceptComponent } from "../icv/noSchemeConcept/noSchemeConceptComponent";
import { NoTopConceptSchemeComponent } from "../icv/noTopConceptScheme/noTopConceptSchemeComponent";
import { TopConceptWithBroaderComponent } from "../icv/topConceptWithBroader/topConceptWithBroaderComponent";
import { DisjointExactMatchConceptComponent } from "../icv/disjointExactMatchConcept/disjointExactMatchConceptComponent";
import { DisjointRelatedConceptComponent } from "../icv/disjointRelatedConcept/disjointRelatedConceptComponent";
import { HierarchicalRedundancyComponent } from "../icv/hierarchicalRedundancy/hierarchicalRedundancyComponent";
import { NoLabelResourceComponent } from "../icv/noLabelResource/noLabelResourceComponent";
import { OnlyAltLabelResourceComponent } from "../icv/onlyAltLabelResource/onlyAltLabelResourceComponent";
import { OverlappedLabelComponent } from "../icv/overlappedLabel/overlappedLabelComponent";
import { NoLangLabelComponent } from "../icv/noLangLabel/noLangLabelComponent";
import { DanglingXLabelComponent } from "../icv/danglingXLabel/danglingXLabelComponent";
import { NoMandatoryLabelComponent } from "../icv/noMandatoryLabel/noMandatoryLabelComponent";
import { MultiplePrefLabelComponent } from "../icv/multiplePrefLabel/multiplePrefLabelComponent";
import { ExtraSpaceLabelComponent } from "../icv/extraSpaceLabel/extraSpaceLabelComponent";
import { NoDefinitionResourceComponent } from "../icv/noDefinitionResource/noDefinitionResourceComponent";
import { CyclicConceptComponent } from "../icv/cyclicConcept/cyclicConceptComponent";

import { IcvConfigPanelComponent } from "../icv/icvConfigPanelComponent";

import { icvRouting } from "../icv/icvRoutes";

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, TreeAndListModule, icvRouting],
    declarations: [
        IcvComponent, IcvListComponent,
        DanglingConceptComponent, NoSchemeConceptComponent, NoTopConceptSchemeComponent, TopConceptWithBroaderComponent,
        DisjointExactMatchConceptComponent, DisjointRelatedConceptComponent, ExtraSpaceLabelComponent, CyclicConceptComponent,
        HierarchicalRedundancyComponent, NoLabelResourceComponent, OnlyAltLabelResourceComponent, OverlappedLabelComponent,
        NoLangLabelComponent, DanglingXLabelComponent, NoMandatoryLabelComponent, MultiplePrefLabelComponent,
        NoDefinitionResourceComponent,
        IcvConfigPanelComponent
    ],
    exports: [IcvComponent],
    providers: []
})
export class ICVModule { }