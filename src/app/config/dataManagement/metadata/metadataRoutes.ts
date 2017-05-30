import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, ProjectGuard } from "../../../utils/CanActivateGuards";

import { MetadataManagementComponent } from "./metadataManagementComponent";
import { MetadataVocabulariesComponent } from "./metadataVocabularies/metadataVocabulariesComponent";
import { NamespacesAndImportsComponent } from "./namespacesAndImports/namespacesAndImportsComponent";

export const routes: Routes = [
    {
        path: "Metadata", component: MetadataManagementComponent, canActivate: [AuthGuard, ProjectGuard], children: [
            { path: "Vocabularies", component: MetadataVocabulariesComponent, canActivate: [AuthGuard, ProjectGuard] },
            { path: "Imports", component: NamespacesAndImportsComponent, canActivate: [AuthGuard, ProjectGuard] }
        ]
    },
];

export const metadataRouting = RouterModule.forChild(routes);