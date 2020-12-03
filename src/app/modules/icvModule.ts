import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { BrokenAlignmentComponent } from "../icv/brokenAlignment/brokenAlignmentComponent";
import { BrokenDefinitionComponent } from "../icv/brokenDefinition/brokenDefinitionComponent";
import { ConflictualLabelComponent } from "../icv/conflictualLabel/conflictualLabelComponent";
import { CyclicConceptComponent } from "../icv/cyclicConcept/cyclicConceptComponent";
import { DanglingConceptComponent } from "../icv/danglingConcept/danglingConceptComponent";
import { DanglingXLabelComponent } from "../icv/danglingXLabel/danglingXLabelComponent";
import { DisjointExactMatchConceptComponent } from "../icv/disjointExactMatchConcept/disjointExactMatchConceptComponent";
import { DisjointRelatedConceptComponent } from "../icv/disjointRelatedConcept/disjointRelatedConceptComponent";
import { ExtraSpaceLabelComponent } from "../icv/extraSpaceLabel/extraSpaceLabelComponent";
import { HierarchicalRedundancyComponent } from "../icv/hierarchicalRedundancy/hierarchicalRedundancyComponent";
import { IcvComponent } from "../icv/icvComponent";
import { IcvConfigPanelComponent } from "../icv/icvConfigPanelComponent";
import { IcvListComponent } from "../icv/icvListComponent";
import { icvRouting } from "../icv/icvRoutes";
import { InvalidUriComponent } from "../icv/invalidUri/invalidUriComponent";
import { MultiplePrefLabelComponent } from "../icv/multiplePrefLabel/multiplePrefLabelComponent";
import { NoDefinitionResourceComponent } from "../icv/noDefinitionResource/noDefinitionResourceComponent";
import { NoLabelResourceComponent } from "../icv/noLabelResource/noLabelResourceComponent";
import { NoLangLabelComponent } from "../icv/noLangLabel/noLangLabelComponent";
import { NoMandatoryLabelComponent } from "../icv/noMandatoryLabel/noMandatoryLabelComponent";
import { NoSchemeConceptComponent } from "../icv/noSchemeConcept/noSchemeConceptComponent";
import { NoTopConceptSchemeComponent } from "../icv/noTopConceptScheme/noTopConceptSchemeComponent";
import { OnlyAltLabelResourceComponent } from "../icv/onlyAltLabelResource/onlyAltLabelResourceComponent";
import { OverlappedLabelComponent } from "../icv/overlappedLabel/overlappedLabelComponent";
import { TopConceptWithBroaderComponent } from "../icv/topConceptWithBroader/topConceptWithBroaderComponent";
import { SharedModule } from './sharedModule';
import { TreeAndListModule } from "./treeAndListModule";


@NgModule({
    imports: [
        icvRouting,
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        TranslateModule,
        TreeAndListModule,
    ],
    declarations: [
        IcvComponent, IcvListComponent,
        DanglingConceptComponent, NoSchemeConceptComponent, NoTopConceptSchemeComponent, TopConceptWithBroaderComponent,
        DisjointExactMatchConceptComponent, DisjointRelatedConceptComponent, ExtraSpaceLabelComponent, CyclicConceptComponent,
        HierarchicalRedundancyComponent, NoLabelResourceComponent, OnlyAltLabelResourceComponent, OverlappedLabelComponent,
        NoLangLabelComponent, DanglingXLabelComponent, NoMandatoryLabelComponent, MultiplePrefLabelComponent,
        NoDefinitionResourceComponent, BrokenAlignmentComponent, BrokenDefinitionComponent, InvalidUriComponent,
        ConflictualLabelComponent,
        IcvConfigPanelComponent
    ],
    exports: [IcvComponent],
    providers: []
})
export class IcvModule { }