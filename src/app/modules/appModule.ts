import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouteReuseStrategy } from "@angular/router";

import { CustomReuseStrategy } from "../a2Customization/CustomReuseStrategy";

import { STServicesModule } from "./stServicesModule";
import { SharedModule } from "./sharedModule";
import { VBModalModule } from "./vbModalModule";
import { ProjectModule } from "./projectModule";
import { CustomFormModule } from "./customFormModule";
import { TreeAndListModule } from "./treeAndListModule";
import { ResourceViewModule } from "./resourceViewModule";
import { ICVModule } from "./icvModule";
import { AdministrationModule } from "./administrationModule";
import { UserModule } from "./userModule";
import { MetadataModule } from "./metadataModule";
import { HistoryValidationModule } from "./historyValidationModule";
import { PreferencesModule } from "./preferencesModule";
import { Sheet2RdfModule } from "./sheet2rdfModule";

import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';

import { AppComponent } from "../appComponent";
import { appRouting } from '../appRoutes';

import { HttpManager } from "../utils/HttpManager";
import { VBProperties } from "../utils/VBProperties";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBCollaboration } from '../utils/VBCollaboration';
import { GUARD_PROVIDERS } from "../utils/CanActivateGuards";
import { UserResolver } from "../utils/UserResolver";

//Components
import { HomeComponent } from "../homeComponent";
import { DataComponent } from "../data/dataComponent";
import { SparqlComponent } from "../sparql/sparqlComponent";
import { AlignmentValidationComponent } from "../alignment/alignmentValidation/alignmentValidationComponent";
import { CollaborationComponent } from "../collaboration/collaborationComponent";
import { LoadDataComponent } from "../config/dataManagement/loadData/loadDataComponent";
import { ExportDataComponent } from "../config/dataManagement/exportData/exportDataComponent";
import { RefactorComponent } from "../config/dataManagement/refactor/refactorComponent";
import { VersioningComponent } from "../config/dataManagement/versioning/versioningComponent";
import { ConfigBarComponent } from "../config/configBar/configBarComponent";

@NgModule({
      imports: [
            RouterModule,
            BrowserModule,
            FormsModule, //check if this is still necessary when declarated component are reduced in favor of more imported modules

            SharedModule, VBModalModule, TreeAndListModule, ResourceViewModule,
            ProjectModule, UserModule, ICVModule, AdministrationModule, CustomFormModule, MetadataModule,
            HistoryValidationModule, PreferencesModule, Sheet2RdfModule,

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
            SparqlComponent,
            AlignmentValidationComponent,
            CollaborationComponent,
            LoadDataComponent,
            ExportDataComponent,
            RefactorComponent,
            VersioningComponent,
      ],
      bootstrap: [AppComponent],
})
export class AppModule { }
