import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomReuseStrategy } from '../a2Customization/CustomReuseStrategy';
import { AppComponent } from '../appComponent';
import { AppRoutingModule } from '../appRoutes';
import { ConfigBarComponent } from '../config/configBar/configBarComponent';
import { ExportDataComponent } from '../config/dataManagement/exportData/exportDataComponent';
import { LoadDataComponent } from '../config/dataManagement/loadData/loadDataComponent';
import { RefactorComponent } from '../config/dataManagement/refactor/refactorComponent';
import { VersioningComponent } from '../config/dataManagement/versioning/versioningComponent';
import { DataComponent } from '../data/dataComponent';
import { HomeComponent } from '../homeComponent';
import { SkosDiffingModule } from '../skosDiffing/skosDiffingModule';
import { GUARD_PROVIDERS } from '../utils/CanActivateGuards';
import { DatatypeValidator } from '../utils/DatatypeValidator';
import { HttpManager } from '../utils/HttpManager';
import { RoleActionResolver } from '../utils/RoleActionResolver';
import { StMetadataRegistry } from '../utils/STMetadataRegistry';
import { UserResolver } from '../utils/UserResolver';
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBEventHandler } from '../utils/VBEventHandler';
import { VBProperties } from '../utils/VBProperties';
import { AdministrationModule } from './administrationModule';
import { AlignmentModule } from './alignmentModule';
import { CollaborationModule } from './collaborationModule';
import { CustomFormModule } from './customFormModule';
import { CustomServicesModule } from './customServicesModule';
import { DatasetCatalogModule } from './datasetCatalogModule';
import { EdoalModule } from './edoalModule';
import { GraphModule } from './graphModule';
import { HistoryValidationModule } from './historyValidationModule';
import { IcvModule } from './icvModule';
import { MetadataModule } from './metadataModule';
import { NotificationsModule } from './notificationsModule';
import { PreferencesModule } from './preferencesModule';
import { ProjectModule } from './projectModule';
import { ResourceMetadataModule } from './resourceMetadataModule';
import { ResourceViewModule } from './resourceViewModule';
import { SharedModule } from './sharedModule';
import { Sheet2RdfModule } from './sheet2rdfModule';
import { SparqlModule } from './sparqlModule';
import { STServicesModule } from './stServicesModule';
import { TreeAndListModule } from './treeAndListModule';
import { UserModule } from './userModule';
import { VBModalModule } from './vbModalModule';

@NgModule({
	imports: [
		BrowserModule,
		CommonModule,
		FormsModule,
		NgbModule,

		AppRoutingModule,

		AdministrationModule, 
		AlignmentModule,
		CollaborationModule,
		CustomFormModule,
		CustomServicesModule,
		DatasetCatalogModule,
		EdoalModule,
		GraphModule,
		HistoryValidationModule,
		IcvModule,
		MetadataModule,
		NotificationsModule,
		PreferencesModule,
		ProjectModule,
		ResourceMetadataModule,
		ResourceViewModule,
		SharedModule,
		Sheet2RdfModule,
		SkosDiffingModule,
		SparqlModule,
		STServicesModule,
		TreeAndListModule,
		UserModule,
		VBModalModule,
	],
	providers: [
		DatatypeValidator,
		HttpManager,
		GUARD_PROVIDERS,
		RoleActionResolver,
		StMetadataRegistry,
		UserResolver,
		VBCollaboration,
		VBEventHandler,
		VBProperties,
		{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
		/** Uses the HashLocationStrategy instead of the default "HTML 5 pushState" PathLocationStrategy.
		 * This solves the 404 error problem when reloading a page in a production server
		 */
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	declarations: [
		AppComponent,
		ConfigBarComponent,
		HomeComponent,
		DataComponent,
		LoadDataComponent,
		ExportDataComponent,
		RefactorComponent,
		VersioningComponent,
  ],
	bootstrap: [AppComponent]
})
export class AppModule { }
