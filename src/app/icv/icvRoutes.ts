import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, ProjectGuard, CanDeactivateModalGuard } from "../utils/CanActivateGuards";

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
import { NoLangLabelComponent } from "./noLangLabel/noLangLabelComponent";
import { DanglingXLabelComponent } from "./danglingXLabel/danglingXLabelComponent";
import { NoMandatoryLabelComponent } from "./noMandatoryLabel/noMandatoryLabelComponent";
import { MultiplePrefLabelComponent } from "./multiplePrefLabel/multiplePrefLabelComponent";
import { DisjointExactMatchConceptComponent } from "./disjointExactMatchConcept/disjointExactMatchConceptComponent";
import { DisjointRelatedConceptComponent } from "./disjointRelatedConcept/disjointRelatedConceptComponent";


export const routes: Routes = [
    {
        path: "Icv", component: IcvComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard], children: [
            { path: "", component: IcvListComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "DanglingConcept", component: DanglingConceptComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "NoSchemeConcept", component: NoSchemeConceptComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "NoTopConceptScheme", component: NoTopConceptSchemeComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "TopConceptWithBroader", component: TopConceptWithBroaderComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "DisjointRelatedConcept", component: DisjointRelatedConceptComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "DisjointExactMatchConcept", component: DisjointExactMatchConceptComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "HierarchicalRedundancy", component: HierarchicalRedundancyComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "NoLabelResource", component: NoLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "OnlyAltLabelResource", component: OnlyAltLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "OverlappedLabelResource", component: OverlappedLabelComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "NoLangLabelResource", component: NoLangLabelComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "NoMandatoryLabelResource", component: NoMandatoryLabelComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "MutliplePrefLabelResource", component: MultiplePrefLabelComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "DanglingXLabel", component: DanglingXLabelComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
        ]
    },
];

export const icvRouting = RouterModule.forChild(routes);