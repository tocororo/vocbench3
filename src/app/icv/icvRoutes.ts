import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, ProjectGuard } from "../utils/CanActivateGuards";
import { BrokenAlignmentComponent } from "./brokenAlignment/brokenAlignmentComponent";
import { BrokenDefinitionComponent } from "./brokenDefinition/brokenDefinitionComponent";
import { ConflictualLabelComponent } from "./conflictualLabel/conflictualLabelComponent";
import { CyclicConceptComponent } from "./cyclicConcept/cyclicConceptComponent";
import { DanglingConceptComponent } from "./danglingConcept/danglingConceptComponent";
import { DanglingXLabelComponent } from "./danglingXLabel/danglingXLabelComponent";
import { DisjointExactMatchConceptComponent } from "./disjointExactMatchConcept/disjointExactMatchConceptComponent";
import { DisjointRelatedConceptComponent } from "./disjointRelatedConcept/disjointRelatedConceptComponent";
import { ExtraSpaceLabelComponent } from "./extraSpaceLabel/extraSpaceLabelComponent";
import { HierarchicalRedundancyComponent } from "./hierarchicalRedundancy/hierarchicalRedundancyComponent";
import { IcvComponent } from "./icvComponent";
import { IcvListComponent } from "./icvListComponent";
import { InvalidUriComponent } from "./invalidUri/invalidUriComponent";
import { MultiplePrefLabelComponent } from "./multiplePrefLabel/multiplePrefLabelComponent";
import { NoDefinitionResourceComponent } from "./noDefinitionResource/noDefinitionResourceComponent";
import { NoLabelResourceComponent } from "./noLabelResource/noLabelResourceComponent";
import { NoLangLabelComponent } from "./noLangLabel/noLangLabelComponent";
import { NoMandatoryLabelComponent } from "./noMandatoryLabel/noMandatoryLabelComponent";
import { NoSchemeConceptComponent } from "./noSchemeConcept/noSchemeConceptComponent";
import { NoTopConceptSchemeComponent } from "./noTopConceptScheme/noTopConceptSchemeComponent";
import { OnlyAltLabelResourceComponent } from "./onlyAltLabelResource/onlyAltLabelResourceComponent";
import { OverlappedLabelComponent } from "./overlappedLabel/overlappedLabelComponent";
import { OwlConsistencyViolationsComponent } from './owlConsistencyViolations/owlConsistencyViolationsComponent';
import { TopConceptWithBroaderComponent } from "./topConceptWithBroader/topConceptWithBroaderComponent";

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
            { path: "OwlViolations", component: OwlConsistencyViolationsComponent, canActivate: [AuthGuard, ProjectGuard] },
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