import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, ProjectGuard } from "../utils/CanActivateGuards";

import { IcvComponent } from "./icvComponent";
import { IcvListComponent } from "./icvListComponent";
import { DanglingConceptComponent } from "./danglingConcept/danglingConceptComponent";
import { NoSchemeConceptComponent } from "./noSchemeConcept/noSchemeConceptComponent";
import { NoTopConceptSchemeComponent } from "./noTopConceptScheme/noTopConceptSchemeComponent";
import { TopConceptWithBroaderComponent } from "./topConceptWithBroader/topConceptWithBroaderComponent";
import { HierarchicalRedundancyComponent } from "./hierarchicalRedundancy/hierarchicalRedundancyComponent";
import { NoLabelResourceComponent } from "./noLabelResource/noLabelResourceComponent";
import { OnlyAltLabelResourceComponent } from "./onlyAltLabelResource/onlyAltLabelResourceComponent";
import { OverlappedLabelComponent } from "./overlappedLabel/overlappedLabelComponent";
import { ConflictualLabelComponent } from "./conflictualLabel/conflictualLabelComponent";
import { NoLangLabelComponent } from "./noLangLabel/noLangLabelComponent";
import { ExtraSpaceLabelComponent } from "./extraSpaceLabel/extraSpaceLabelComponent";
import { DanglingXLabelComponent } from "./danglingXLabel/danglingXLabelComponent";
import { NoMandatoryLabelComponent } from "./noMandatoryLabel/noMandatoryLabelComponent";
import { MultiplePrefLabelComponent } from "./multiplePrefLabel/multiplePrefLabelComponent";
import { DisjointExactMatchConceptComponent } from "./disjointExactMatchConcept/disjointExactMatchConceptComponent";
import { DisjointRelatedConceptComponent } from "./disjointRelatedConcept/disjointRelatedConceptComponent";
import { NoDefinitionResourceComponent } from "./noDefinitionResource/noDefinitionResourceComponent";
import { CyclicConceptComponent } from "./cyclicConcept/cyclicConceptComponent";
import { BrokenAlignmentComponent } from "./brokenAlignment/brokenAlignmentComponent";
import { BrokenDefinitionComponent } from "./brokenDefinition/brokenDefinitionComponent";
import { InvalidUriComponent } from "./invalidUri/invalidUriComponent";


export const routes: Routes = [
    {
        path: "", component: IcvComponent, canActivate: [AuthGuard, ProjectGuard], children: [
            { path: "", component: IcvListComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "DanglingConcept", component: DanglingConceptComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "NoSchemeConcept", component: NoSchemeConceptComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "NoTopConceptScheme", component: NoTopConceptSchemeComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "TopConceptWithBroader", component: TopConceptWithBroaderComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "DisjointRelatedConcept", component: DisjointRelatedConceptComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "DisjointExactMatchConcept", component: DisjointExactMatchConceptComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "HierarchicalRedundancy", component: HierarchicalRedundancyComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "HierarchicalCycle", component: CyclicConceptComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "NoLabelResource", component: NoLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "OnlyAltLabelResource", component: OnlyAltLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "OverlappedLabelResource", component: OverlappedLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "ConflictualLabelResource", component: ConflictualLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "NoLangLabelResource", component: NoLangLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "ExtraSpaceLabelResource", component: ExtraSpaceLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "NoMandatoryLabelResource", component: NoMandatoryLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "MutliplePrefLabelResource", component: MultiplePrefLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "DanglingXLabel", component: DanglingXLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "NoDefinitionResource", component: NoDefinitionResourceComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "BrokenAlignment", component: BrokenAlignmentComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "BrokenDefinition", component: BrokenDefinitionComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "InvalidURI", component: InvalidUriComponent, canActivate: [AuthGuard, ProjectGuard] }
        ]
    },
];

export const icvRouting = RouterModule.forChild(routes);