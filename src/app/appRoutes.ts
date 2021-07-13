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
import { UserProfileComponent } from './user/userProfileComponent';
import { UserActionsComponent } from './user/userActionsComponent';
import { AdminGuard, AuthGuard, ProjectGuard, SystemSettingsGuard } from './utils/CanActivateGuards';
import { UserResolver } from './utils/UserResolver';

const routes: Routes = [
	{ path: "", redirectTo: "/Home", pathMatch: "full" },
	{ path: "Home", component: HomeComponent, canActivate: [SystemSettingsGuard], resolve: { user: UserResolver } },
	// // route config of navigation bar
	{ path: "Projects", component: ProjectComponent, canActivate: [SystemSettingsGuard, AdminGuard] },
	{ path: "Projects/CreateProject", component: CreateProjectComponent, canActivate: [SystemSettingsGuard, AdminGuard] },
	{ path: "Data", component: DataComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Edoal", component: EdoalComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Sparql", component: SparqlComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Vocabularies", component: MetadataVocabulariesComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Imports", component: NamespacesAndImportsComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "MetadataRegistry", component: MetadataRegistryComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "History", component: HistoryComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Validation", component: ValidationComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "AlignmentValidation", component: AlignmentValidationComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Sheet2RDF", component: Sheet2RdfComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "SkosDiffing", component: SkosDiffingComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Collaboration", component: CollaborationComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "CustomForm", component: CustomFormConfigComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "CustomServices", component: CustomServiceRouterComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Notifications", component: NotificationsComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "ResourceMetadata", component: ResourceMetadataComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Registration/:firstAccess", component: RegistrationComponent, canActivate: [SystemSettingsGuard] }, //param firstAccess 1 to indicate that there's no user registered
	{ path: "ResetPassword/:token", component: ResetPasswordComponent, canActivate: [SystemSettingsGuard] },
	{ path: "UserActions", component: UserActionsComponent, canActivate: [SystemSettingsGuard] },
	{ path: "Profile", component: UserProfileComponent, canActivate: [SystemSettingsGuard, AuthGuard] },
	{ path: "Preferences", component: VocbenchPreferencesComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	//lazy loading of module with child route
	{ 
		path: "Administration", 
		loadChildren: () => import('./modules/administrationModule').then(m => m.AdministrationModule),
		canLoad: [SystemSettingsGuard, AuthGuard] 
	},
	{ 
		path: "Icv", 
		loadChildren: () => import('./modules/icvModule').then(m => m.IcvModule),
		canLoad: [SystemSettingsGuard, AuthGuard, ProjectGuard] 
	},
	// route config of config bar
	{ path: "Config/LoadData", component: LoadDataComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Config/ExportData", component: ExportDataComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Config/Refactor", component: RefactorComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Config/Versioning", component: VersioningComponent, canActivate: [SystemSettingsGuard, AuthGuard, ProjectGuard] },
	{ path: "Sysconfig", component: SystemConfigurationComponent, canActivate: [SystemSettingsGuard, AuthGuard] },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }