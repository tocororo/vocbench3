import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouteReuseStrategy } from "@angular/router";

import { CustomReuseStrategy } from "../a2Customization/CustomReuseStrategy";

import { STServicesModule } from "./stServicesModule";
import { SharedModule } from "./sharedModule";
import { VBModalModule } from "./vbModalModule";
import { CustomFormModule } from "./customFormModule";
import { TreeAndListModule } from "./treeAndListModule";
import { ResourceViewModule } from "./resourceViewModule";
import { ICVModule } from "./icvModule";
import { AdministrationModule } from "./administrationModule";
import { UserModule } from "./userModule";

import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';

import { AppComponent } from "../appComponent";
import { appRouting } from '../appRoutes';

import { HttpManager } from "../utils/HttpManager";
import { VocbenchCtx } from "../utils/VocbenchCtx";
import { VBEventHandler } from "../utils/VBEventHandler";
import { GUARD_PROVIDERS } from "../utils/CanActivateGuards";

//Components
import { HomeComponent } from "../homeComponent";
import { ProjectComponent } from "../project/projectComponent";
import { DataComponent } from "../data/dataComponent";
import { SparqlComponent } from "../sparql/sparqlComponent";
import { AlignmentValidationComponent } from "../alignment/alignmentValidation/alignmentValidationComponent";
import { CustomFormComponent } from "../customForms/customFormComponent";
import { ImportProjectComponent } from "../project/importProject/importProjectComponent";
import { CreateProjectComponent } from "../project/createProject/createProjectComponent";
import { IcvComponent } from "../icv/icvComponent";
import { LoadDataComponent } from "../config/dataManagement/loadData/loadDataComponent";
import { ExportDataComponent } from "../config/dataManagement/exportData/exportDataComponent";
import { MetadataManagementComponent } from "../config/dataManagement/metadata/metadataManagementComponent";
import { RefactorComponent } from "../config/dataManagement/refactor/refactorComponent";
import { VocbenchSettingsComponent } from "../settings/vocbenchSettingsComponent";
import { TestComponent } from "../test/testComponent";
import { ConfigBarComponent } from "../config/configBar/configBarComponent";
import { AdministrationComponent } from "../administration/administrationComponent";

@NgModule({
      imports: [
            BrowserModule, RouterModule,
            FormsModule, //check if this is still necessary when declarated component are reduced in favor of more imported modules

            SharedModule, VBModalModule, TreeAndListModule, ResourceViewModule,
            UserModule, ICVModule, AdministrationModule, CustomFormModule,

            STServicesModule,
            appRouting,
            ModalModule.forRoot(), BootstrapModalModule //Modules of angular2-modal
      ],
      //services with application scope
      providers: [
            HttpManager, VocbenchCtx, VBEventHandler, GUARD_PROVIDERS,
            { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
      ],
      declarations: [
            AppComponent,
            ConfigBarComponent,
            HomeComponent,
            ProjectComponent,
            ImportProjectComponent,
            CreateProjectComponent,
            DataComponent,
            SparqlComponent,
            IcvComponent,
            AlignmentValidationComponent,
            CustomFormComponent,
            LoadDataComponent,
            ExportDataComponent,
            MetadataManagementComponent,
            RefactorComponent,
            VocbenchSettingsComponent,
            AdministrationComponent,
            //remove???
            TestComponent
      ],
      bootstrap: [AppComponent],
})
export class AppModule { }
