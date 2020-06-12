import { RouterModule, Routes } from '@angular/router';
import { SystemConfigurationComponent } from './administration/systemConfiguration/systemConfigurationComponent';
import { AlignmentValidationComponent } from './alignment/alignmentValidation/alignmentValidationComponent';
import { CollaborationComponent } from './collaboration/collaborationComponent';
import { ExportDataComponent } from "./config/dataManagement/exportData/exportDataComponent";
import { LoadDataComponent } from "./config/dataManagement/loadData/loadDataComponent";
import { RefactorComponent } from "./config/dataManagement/refactor/refactorComponent";
import { VersioningComponent } from "./config/dataManagement/versioning/versioningComponent";
import { CustomFormConfigComponent } from "./customForms/customFormConfComponent";
import { CustomServiceRouterComponent } from './customServices/customServiceRouterComponent';
import { DataComponent } from "./data/dataComponent";
import { EdoalComponent } from './edoal/edoalComponent';
import { HistoryComponent } from "./historyValidation/historyComponent";
import { ValidationComponent } from "./historyValidation/validationComponent";
import { HomeComponent } from "./homeComponent";
import { MetadataRegistryComponent } from './metadata/metadataRegistry/metadataRegistryComponent';
import { MetadataVocabulariesComponent } from './metadata/metadataVocabularies/metadataVocabulariesComponent';
import { NamespacesAndImportsComponent } from './metadata/namespacesAndImports/namespacesAndImportsComponent';
import { VocbenchPreferencesComponent } from "./preferences/vocbenchPreferencesComponent";
import { CreateProjectComponent } from "./project/createProject/createProjectComponent";
import { ProjectComponent } from "./project/projectComponent";
import { ResourceMetadataComponent } from "./resourceMetadata/resourceMetadataComponent";
import { Sheet2RdfComponent } from "./sheet2rdf/sheet2rdfComponent";
import { SparqlComponent } from "./sparql/sparqlComponent";
import { RegistrationComponent } from "./user/registrationComponent";
import { ResetPasswordComponent } from "./user/resetPasswordComponent";
import { UserProfileComponent } from "./user/userProfileComponent";
import { AdminGuard, AuthGuard, ProjectGuard } from "./utils/CanActivateGuards";
import { UserResolver } from "./utils/UserResolver";

export const routes: Routes = [
    { path: "", redirectTo: "/Home", pathMatch: "full" },
    { path: "Home", component: HomeComponent, resolve: { user : UserResolver } },
    // route config of navigation bar
    { path: "Projects", component: ProjectComponent, canActivate: [AdminGuard] },
    { path: "Projects/CreateProject", component: CreateProjectComponent, canActivate: [AdminGuard] },
    { path: "Data", component: DataComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Edoal", component: EdoalComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Sparql", component: SparqlComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Vocabularies", component: MetadataVocabulariesComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Imports", component: NamespacesAndImportsComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "MetadataRegistry", component: MetadataRegistryComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "History", component: HistoryComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Validation", component: ValidationComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "AlignmentValidation", component: AlignmentValidationComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Sheet2RDF", component: Sheet2RdfComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Collaboration", component: CollaborationComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "CustomForm", component: CustomFormConfigComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "CustomServices", component: CustomServiceRouterComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "ResourceMetadata", component: ResourceMetadataComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Registration/:firstAccess", component: RegistrationComponent }, //param firstAccess 1 to indicate that there's no user registered
    { path: "ResetPassword/:token", component: ResetPasswordComponent },
    { path: "Profile", component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: "Preferences", component: VocbenchPreferencesComponent, canActivate: [AuthGuard, ProjectGuard] },
    //lazy loading of module with child route
    { path: "Administration", loadChildren: "./modules/administrationModule#AdministrationModule", canLoad: [AuthGuard] },
    { path: "Icv", loadChildren: "./modules/icvModule#IcvModule", canLoad: [AuthGuard, ProjectGuard] },
    // route config of config bar
    { path: "Config/LoadData", component: LoadDataComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Config/ExportData", component: ExportDataComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Config/Refactor", component: RefactorComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Config/Versioning", component: VersioningComponent, canActivate: [AuthGuard, ProjectGuard] },
    { path: "Sysconfig", component: SystemConfigurationComponent, canActivate: [AuthGuard] },
];

/*
useHash: true sets the HashLocationStrategy instead of the default "HTML 5 pushState" PathLocationStrategy
this solves the 404 error problem when reloading a page in a production server.
(see http://stackoverflow.com/questions/35284988/angular-2-404-error-occur-when-i-refresh-through-browser)
Another solution could be to configure the application server to support HTML5 pushState
(but this requires changes by the client on the application server that hosts VB3)
*/
export const appRouting = RouterModule.forRoot(routes, { useHash: true });