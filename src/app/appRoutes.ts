import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, AdminGuard, ProjectGuard, UnsavedChangesGuard } from "./utils/CanActivateGuards";
import { UserResolver } from "./utils/UserResolver";

import { HomeComponent } from "./homeComponent";
import { ProjectComponent } from "./project/projectComponent";
import { DataComponent } from "./data/dataComponent";
import { SparqlComponent } from "./sparql/sparqlComponent";
import { HistoryComponent } from "./historyValidation/historyComponent";
import { ValidationComponent } from "./historyValidation/validationComponent";
import { AlignmentValidationComponent } from "./alignment/alignmentValidation/alignmentValidationComponent";
import { Sheet2RdfComponent } from "./sheet2rdf/sheet2rdfComponent";
import { CollaborationComponent } from './collaboration/collaborationComponent';
import { CustomFormConfigComponent } from "./customForms/customFormConfComponent";
import { CreateProjectComponent } from "./project/createProject/createProjectComponent";
import { LoadDataComponent } from "./config/dataManagement/loadData/loadDataComponent";
import { ExportDataComponent } from "./config/dataManagement/exportData/exportDataComponent";
import { RefactorComponent } from "./config/dataManagement/refactor/refactorComponent";
import { VersioningComponent } from "./config/dataManagement/versioning/versioningComponent";
import { VocbenchPreferencesComponent } from "./preferences/vocbenchPreferencesComponent";
import { UserProfileComponent } from "./user/userProfileComponent";
import { RegistrationComponent } from "./user/registrationComponent";
import { ResetPasswordComponent } from "./user/resetPasswordComponent";

export const routes: Routes = [
    { path: "", redirectTo: "/Home", pathMatch: "full" },
    { path: "Home", component: HomeComponent, resolve: { user : UserResolver } },
    // route config of navigation bar
    { path: "Projects", component: ProjectComponent, canActivate: [AdminGuard] },
    { path: "Data", component: DataComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Sparql", component: SparqlComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "History", component: HistoryComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Validation", component: ValidationComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "AlignmentValidation", component: AlignmentValidationComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Sheet2RDF", component: Sheet2RdfComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Collaboration", component: CollaborationComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "CustomForm", component: CustomFormConfigComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Registration/:firstAccess", component: RegistrationComponent }, //param firstAccess 1 to indicate that there's no user registered
    { path: "ResetPassword/:token", component: ResetPasswordComponent },
    { path: "Profile", component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: "Preferences", component: VocbenchPreferencesComponent, canActivate: [AuthGuard, ProjectGuard] },
    //lazy loading of module with child route
    { path: "Metadata", loadChildren: "./modules/metadataModule#metadataModule", canLoad: [AuthGuard, ProjectGuard] },
    { path: "Administration", loadChildren: "./modules/administrationModule#AdministrationModule", canLoad: [AuthGuard] },
    { path: "Icv", loadChildren: "./modules/icvModule#IcvModule", canLoad: [AuthGuard, ProjectGuard] },
    // route config of config bar
    { path: "Config/LoadData", component: LoadDataComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Config/ExportData", component: ExportDataComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Config/Refactor", component: RefactorComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Config/Versioning", component: VersioningComponent, canActivate: [AuthGuard, ProjectGuard] },
    // route config for project management
    { path: "Projects/CreateProject", component: CreateProjectComponent, canActivate: [AdminGuard] },
];

/*
useHash: true sets the HashLocationStrategy instead of the default "HTML 5 pushState" PathLocationStrategy
this solves the 404 error problem when reloading a page in a production server.
(see http://stackoverflow.com/questions/35284988/angular-2-404-error-occur-when-i-refresh-through-browser)
Another solution could be to configure the application server to support HTML5 pushState
(but this requires changes by the client on the application server that hosts VB3)
*/
export const appRouting = RouterModule.forRoot(routes, { useHash: true });