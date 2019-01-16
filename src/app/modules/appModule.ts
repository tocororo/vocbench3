import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from "@angular/router";
import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';
import { CustomReuseStrategy } from "../a2Customization/CustomReuseStrategy";
import { AlignmentValidationComponent } from "../alignment/alignmentValidation/alignmentValidationComponent";
import { AppComponent } from "../appComponent";
import { appRouting } from '../appRoutes';
import { ConfigBarComponent } from "../config/configBar/configBarComponent";
import { ExportDataComponent } from "../config/dataManagement/exportData/exportDataComponent";
import { LoadDataComponent } from "../config/dataManagement/loadData/loadDataComponent";
import { RefactorComponent } from "../config/dataManagement/refactor/refactorComponent";
import { VersioningComponent } from "../config/dataManagement/versioning/versioningComponent";
import { DataComponent } from "../data/dataComponent";
import { HomeComponent } from "../homeComponent";
import { GUARD_PROVIDERS } from "../utils/CanActivateGuards";
import { HttpManager } from "../utils/HttpManager";
import { UserResolver } from "../utils/UserResolver";
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { AdministrationModule } from "./administrationModule";
import { CollaborationModule } from './collaborationModule';
import { CustomFormModule } from "./customFormModule";
import { DatasetCatalogModule } from './datasetCatalogModule';
import { GraphModule } from './graphModule';
import { HistoryValidationModule } from "./historyValidationModule";
import { ICVModule } from "./icvModule";
import { MetadataModule } from "./metadataModule";
import { PreferencesModule } from "./preferencesModule";
import { ProjectModule } from "./projectModule";
import { ResourceViewModule } from "./resourceViewModule";
import { SharedModule } from "./sharedModule";
import { Sheet2RdfModule } from "./sheet2rdfModule";
import { SparqlModule } from './sparqlModule';
import { STServicesModule } from "./stServicesModule";
import { TreeAndListModule } from "./treeAndListModule";
import { UserModule } from "./userModule";
import { VBModalModule } from "./vbModalModule";

@NgModule({
      imports: [
            RouterModule,
            BrowserModule,
            FormsModule, //check if this is still necessary when declarated component are reduced in favor of more imported modules

            SharedModule, VBModalModule, TreeAndListModule, ResourceViewModule, GraphModule,
            ProjectModule, UserModule, ICVModule, AdministrationModule, CustomFormModule, MetadataModule, DatasetCatalogModule,
            HistoryValidationModule, PreferencesModule, Sheet2RdfModule, SparqlModule, CollaborationModule,

            STServicesModule,
            appRouting,
            ModalModule.forRoot(), BootstrapModalModule //Modules of ngx-modialog
      ],
      //services with application scope
      providers: [
            HttpManager, VBEventHandler, VBProperties, VBCollaboration, GUARD_PROVIDERS, UserResolver,
            { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
      ],
      declarations: [
            AppComponent,
            ConfigBarComponent,
            HomeComponent,
            DataComponent,
            AlignmentValidationComponent,
            LoadDataComponent,
            ExportDataComponent,
            RefactorComponent,
            VersioningComponent,
      ],
      bootstrap: [AppComponent],
})
export class AppModule { }
