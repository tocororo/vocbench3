import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemConfigurationComponent } from './administration/systemConfiguration/systemConfigurationComponent';
import { AlignmentValidationComponent } from './alignment/alignmentValidation/alignmentValidationComponent';
import { CollaborationComponent } from './collaboration/collaborationComponent';
import { ExportDataComponent } from './config/dataManagement/exportData/exportDataComponent';
import { LoadDataComponent } from './config/dataManagement/loadData/loadDataComponent';
import { RefactorComponent } from './config/dataManagement/refactor/refactorComponent';
import { VersioningComponent } from './config/dataManagement/versioning/versioningComponent';
import { CustomFormConfigComponent } from './customForms/customFormConfComponent';
import { CustomFormViewPageComponent } from './customFormView/customFormViewPageComponent';
import { CustomServiceRouterComponent } from './customServices/customServiceRouterComponent';
import { DataComponent } from './data/dataComponent';
import { EdoalComponent } from './edoal/edoalComponent';
import { HistoryComponent } from './historyValidation/historyComponent';
import { ValidationComponent } from './historyValidation/validationComponent';
import { HomeComponent } from './homeComponent';
import { MetadataRegistryComponent } from './metadata/metadataRegistry/metadataRegistryComponent';
import { MetadataVocabulariesComponent } from './metadata/metadataVocabularies/metadataVocabulariesComponent';
import { NamespacesAndImportsComponent } from './metadata/namespacesAndImports/namespacesAndImportsComponent';
import { NotificationsComponent } from './notifications/notificationsComponent';
import { VocbenchPreferencesComponent } from './preferences/vocbenchPreferencesComponent';
import { CreateProjectComponent } from './project/createProject/createProjectComponent';
import { ProjectComponent } from './project/projectComponent';
import { ResourceMetadataComponent } from './resourceMetadata/resourceMetadataComponent';
import { Sheet2RdfComponent } from './sheet2rdf/sheet2rdfComponent';
import { SkosDiffingComponent } from './skosDiffing/skosDiffingComponent';
import { SparqlComponent } from './sparql/sparqlComponent';
import { RegistrationComponent } from './user/registrationComponent';
import { ResetPasswordComponent } from './user/resetPasswordComponent';
import { UserActionsComponent } from './user/userActionsComponent';
import { UserProfileComponent } from './user/userProfileComponent';
import { AsyncGuardResolver, AuthGuard, ProjectGuard, SystemSettingsGuard, VBGuards } from './utils/CanActivateGuards';
import { UserResolver } from './utils/UserResolver';

const routes: Routes = [
    { path: "", redirectTo: "/Home", pathMatch: "full" },
    { path: "Home", component: HomeComponent, canActivate: [SystemSettingsGuard], resolve: { user: UserResolver } },
    // // route config of navigation bar
    { path: "Projects", component: ProjectComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AdminGuard] } },
    { path: "Projects/CreateProject", component: CreateProjectComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.SuperUserGuard] } },
    { path: "Data", component: DataComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Edoal", component: EdoalComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Sparql", component: SparqlComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Vocabularies", component: MetadataVocabulariesComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Imports", component: NamespacesAndImportsComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "MetadataRegistry", component: MetadataRegistryComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "History", component: HistoryComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Validation", component: ValidationComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "AlignmentValidation", component: AlignmentValidationComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Sheet2RDF", component: Sheet2RdfComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "SkosDiffing", component: SkosDiffingComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Collaboration", component: CollaborationComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "CustomForm", component: CustomFormConfigComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "CustomFormView", component: CustomFormViewPageComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "CustomServices", component: CustomServiceRouterComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Notifications", component: NotificationsComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "ResourceMetadata", component: ResourceMetadataComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.PMGuard, VBGuards.ProjectGuard] } },
    { path: "LoadData", component: LoadDataComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "ExportData", component: ExportDataComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Refactor", component: RefactorComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Versioning", component: VersioningComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "Sysconfig", component: SystemConfigurationComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard] } },
    { path: "Registration/:firstAccess", component: RegistrationComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard] } }, //param firstAccess 1 if no user registered
    { path: "Profile", component: UserProfileComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard] } },
    { path: "Preferences", component: VocbenchPreferencesComponent, canActivate: [AsyncGuardResolver], data: { guards: [VBGuards.SystemSettingsGuard, VBGuards.AuthGuard, VBGuards.ProjectGuard] } },
    { path: "ResetPassword/:token", component: ResetPasswordComponent },
    { path: "UserActions", component: UserActionsComponent },
    //lazy loading of module with child route
    {
        path: "Administration",
        loadChildren: () => import('./modules/administrationModule').then(m => m.AdministrationModule),
        canLoad: [AuthGuard]
    },
    {
        path: "Icv",
        loadChildren: () => import('./modules/icvModule').then(m => m.IcvModule),
        canLoad: [AuthGuard, ProjectGuard]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }