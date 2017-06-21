import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, AdminGuard, ProjectGuard, UnsavedChangesGuard, CanDeactivateModalGuard } from "./utils/CanActivateGuards";
import { UserResolver } from "./utils/UserResolver";

import { HomeComponent } from "./homeComponent";
import { ProjectComponent } from "./project/projectComponent";
import { DataComponent } from "./data/dataComponent";
import { SparqlComponent } from "./sparql/sparqlComponent";
import { HistoryComponent } from "./historyValidation/historyComponent";
import { ValidationComponent } from "./historyValidation/validationComponent";
import { AlignmentValidationComponent } from "./alignment/alignmentValidation/alignmentValidationComponent";
import { CustomFormConfigComponent } from "./customForms/customFormConfComponent";
import { ImportProjectComponent } from "./project/importProject/importProjectComponent";
import { CreateProjectComponent } from "./project/createProject/createProjectComponent";
import { LoadDataComponent } from "./config/dataManagement/loadData/loadDataComponent";
import { ExportDataComponent } from "./config/dataManagement/exportData/exportDataComponent";
import { RefactorComponent } from "./config/dataManagement/refactor/refactorComponent";
import { VersioningComponent } from "./config/dataManagement/versioning/versioningComponent";
import { VocbenchSettingsComponent } from "./settings/vocbenchSettingsComponent";
import { UserProfileComponent } from "./user/userProfileComponent";
import { RegistrationComponent } from "./user/registrationComponent";
import { ResetPasswordComponent } from "./user/resetPasswordComponent";

export const routes: Routes = [
    { path: "", redirectTo: "/Home", pathMatch: "full" },
    { path: "Home", component: HomeComponent, resolve: { user : UserResolver }, canDeactivate: [CanDeactivateModalGuard] },
    // route config of navigation bar
    { path: "Projects", component: ProjectComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Data", component: DataComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Sparql", component: SparqlComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "History", component: HistoryComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Validation", component: ValidationComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "AlignmentValidation", component: AlignmentValidationComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "CustomForm", component: CustomFormConfigComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Registration/:firstAccess", component: RegistrationComponent, canDeactivate: [CanDeactivateModalGuard] }, //param firstAccess 1 to indicate that there's no user registered
    { path: "ResetPassword/:token", component: ResetPasswordComponent, canDeactivate: [CanDeactivateModalGuard] },
    { path: "Profile", component: UserProfileComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Settings", component: VocbenchSettingsComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    //lazy loading of module with child route
    { path: "Metadata", loadChildren: "./modules/metadataModule#metadataModule", canLoad: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Administration", loadChildren: "./modules/administrationModule#AdministrationModule", canLoad: [AdminGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Icv", loadChildren: "./modules/icvModule#IcvModule", canLoad: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    // route config of config bar
    { path: "Config/LoadData", component: LoadDataComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Config/ExportData", component: ExportDataComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Config/Refactor", component: RefactorComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Config/Versioning", component: VersioningComponent, canActivate: [AuthGuard, ProjectGuard], canDeactivate: [CanDeactivateModalGuard] },
    // route config for project management
    { path: "Projects/ImportProject", component: ImportProjectComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateModalGuard] },
    { path: "Projects/CreateProject", component: CreateProjectComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateModalGuard] },
];

/*
useHash: true sets the HashLocationStrategy instead of the default "HTML 5 pushState" PathLocationStrategy
this solves the 404 error problem when reloading a page in a production server.
(see http://stackoverflow.com/questions/35284988/angular-2-404-error-occur-when-i-refresh-through-browser)
Another solution could be to configure the application server to support HTML5 pushState
(but this requires changes by the client on the application server that hosts VB3)
*/
export const appRouting = RouterModule.forRoot(routes, { useHash: true });