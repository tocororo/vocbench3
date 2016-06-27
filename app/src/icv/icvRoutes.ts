import {RouterConfig} from '@angular/router';
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

export const IcvRoutes: RouterConfig = [
  { path: '', redirectTo: '/Icv', terminal: true, canActivate: [AuthGuard, ProjectGuard] },
  {
    path: 'Icv', component: IcvComponent, canActivate: [AuthGuard, ProjectGuard], children: [
      { path: "NoSchemeConcept", component: NoSchemeConceptComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: "NoTopConceptScheme", component: NoTopConceptSchemeComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: "TopConceptWithBroader", component: TopConceptWithBroaderComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: "HierarchicalRedundancy", component: HierarchicalRedundancyComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: "NoLabelResource", component: NoLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: "OnlyAltLabelResource", component: OnlyAltLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: "OverlappedLabelResource", component: OverlappedLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: "NoLangLabelResource", component: NoLangLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: "DanglingXLabel", component: DanglingXLabelComponent, canActivate: [AuthGuard, ProjectGuard] },
      { path: '', component: IcvListComponent, canActivate: [AuthGuard, ProjectGuard] },
    ]
  }
];


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/