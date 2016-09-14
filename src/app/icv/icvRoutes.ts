import {RouterModule, Routes} from '@angular/router';

import {AuthGuard, ProjectGuard} from "../utils/CanActivateGuards";

import {IcvComponent} from "./icvComponent";
import {IcvListComponent} from "./icvListComponent";
import {DanglingConceptComponent} from "./danglingConcept/danglingConceptComponent";
import {NoSchemeConceptComponent} from "./noSchemeConcept/noSchemeConceptComponent";
import {NoTopConceptSchemeComponent} from "./noTopConceptScheme/noTopConceptSchemeComponent";
import {TopConceptWithBroaderComponent} from "./topConceptWithBroader/topConceptWithBroaderComponent";
import {HierarchicalRedundancyComponent} from "./hierarchicalRedundancy/hierarchicalRedundancyComponent";
import {NoLabelResourceComponent} from "./noLabelResource/noLabelResourceComponent";
import {OnlyAltLabelResourceComponent} from "./onlyAltLabelResource/onlyAltLabelResourceComponent";
import {OverlappedLabelComponent} from "./overlappedLabel/overlappedLabelComponent";
import {NoLangLabelComponent} from "./noLangLabel/noLangLabelComponent";
import {DanglingXLabelComponent} from "./danglingXLabel/danglingXLabelComponent";

export const routes: Routes = [
    {path: "Icv", component: IcvComponent, canActivate: [AuthGuard, ProjectGuard], children: [
        {path: "", component: IcvListComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "DanglingConcept", component: DanglingConceptComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "NoSchemeConcept", component: NoSchemeConceptComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "NoTopConceptScheme", component: NoTopConceptSchemeComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "TopConceptWithBroader", component: TopConceptWithBroaderComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "HierarchicalRedundancy", component: HierarchicalRedundancyComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "NoLabelResource", component: NoLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "OnlyAltLabelResource", component: OnlyAltLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "OverlappedLabelResource", component: OverlappedLabelComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "NoLangLabelResource", component: NoLangLabelComponent, canActivate: [AuthGuard, ProjectGuard]},
        {path: "DanglingXLabel", component: DanglingXLabelComponent, canActivate: [AuthGuard, ProjectGuard]},
    ]},
];

export const icvRouting = RouterModule.forChild(routes);