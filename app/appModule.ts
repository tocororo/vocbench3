import {NgModule} from '@angular/core';

import {Renderer} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {RouterModule} from "@angular/router";

import {STServicesModule} from "./src/services/stServicesModule";
import {ProjectModule} from "./src/project/projectModule";
import {PropertyModule} from "./src/property/propertyModule";

import {SharedModule} from "./src/widget/sharedModule";
import {VBModalModule} from "./src/widget/vbModalModule";


import {ModalModule} from 'angular2-modal';
import {BootstrapModalModule} from 'angular2-modal/plugins/bootstrap';

import {HttpManager} from "./src/utils/HttpManager";
import {VocbenchCtx} from "./src/utils/VocbenchCtx";
import {VBEventHandler} from "./src/utils/VBEventHandler";
import {GUARD_PROVIDERS} from "./src/utils/CanActivateGuards";

import {ModalServices} from "./src/widget/modal/modalServices";
import {BrowsingServices} from "./src/widget/modal/browsingModal/browsingServices";
import {AuthServices} from "./src/auth/authServices";

import {App} from "./src/app";
import {appRouting} from './src/appRoutes';

//Components
import {HomeComponent} from "./src/homeComponent";
import {ProjectComponent} from "./src/project/projectComponent";
import {ConceptsComponent} from "./src/skos/concept/conceptsComponent";
import {ClassComponent} from "./src/owl/classComponent";
import {PropertyComponent} from "./src/property/propertyComponent";
import {SchemesComponent} from "./src/skos/scheme/schemesComponent";
import {CollectionsComponent} from "./src/skos/collection/collectionsComponent";
import {SparqlComponent} from "./src/sparql/sparqlComponent";
import {AlignmentValidationComponent} from "./src/alignment/alignmentValidation/alignmentValidationComponent";
import {CustomRangeComponent} from "./src/customRanges/customRangeComponent";
import {ImportProjectComponent} from "./src/project/importProject/importProjectComponent";
import {CreateProjectComponent} from "./src/project/createProject/createProjectComponent";
import {IcvComponent} from "./src/icv/icvComponent";
import {DanglingConceptComponent} from "./src/icv/danglingConcept/danglingConceptComponent";
import {NoSchemeConceptComponent} from "./src/icv/noSchemeConcept/noSchemeConceptComponent";
import {NoTopConceptSchemeComponent} from "./src/icv/noTopConceptScheme/noTopConceptSchemeComponent";
import {TopConceptWithBroaderComponent} from "./src/icv/topConceptWithBroader/topConceptWithBroaderComponent";
import {HierarchicalRedundancyComponent} from "./src/icv/hierarchicalRedundancy/hierarchicalRedundancyComponent";
import {NoLabelResourceComponent} from "./src/icv/noLabelResource/noLabelResourceComponent";
import {OnlyAltLabelResourceComponent} from "./src/icv/onlyAltLabelResource/onlyAltLabelResourceComponent";
import {OverlappedLabelComponent} from "./src/icv/overlappedLabel/overlappedLabelComponent";
import {NoLangLabelComponent} from "./src/icv/noLangLabel/noLangLabelComponent";
import {DanglingXLabelComponent} from "./src/icv/danglingXLabel/danglingXLabelComponent";
import {ImportDataComponent} from "./src/config/dataManagement/importData/importDataComponent";
import {ExportDataComponent} from "./src/config/dataManagement/exportData/exportDataComponent";
import {MetadataManagementComponent} from "./src/config/dataManagement/metadata/metadataManagementComponent";
import {VocbenchSettingsComponent} from "./src/settings/vocbenchSettingsComponent";
import {RegistrationComponent} from "./src/user/registrationComponent";
import {TestComponent} from "./src/test/testComponent";

@NgModule({
      imports: [
            BrowserModule, RouterModule, 
            FormsModule, //check if this is still necessary when declarated component are reduced in favor of more imported modules

            SharedModule, VBModalModule,
            STServicesModule,
            appRouting,
            ModalModule.forRoot(), BootstrapModalModule //Modules of angular2-modal
      ],
      //services with application scope
      providers: [
            HttpManager, VocbenchCtx, VBEventHandler,
            AuthServices, GUARD_PROVIDERS,
            ModalServices, BrowsingServices,

            Renderer, //needed form modal (maybe can be moved in a VBModalModule or wherever there are modals)
      ],
      declarations: [
            App,
            
            HomeComponent,
            ProjectComponent,
            ImportProjectComponent,
            CreateProjectComponent,
            ConceptsComponent,
            ClassComponent,
            PropertyComponent,
            SchemesComponent,
            CollectionsComponent,
            SparqlComponent,
            AlignmentValidationComponent,
            CustomRangeComponent,

            //icv(s) could be moved in a separate module
            IcvComponent,
            DanglingConceptComponent,
            NoSchemeConceptComponent,
            NoTopConceptSchemeComponent,
            TopConceptWithBroaderComponent,
            HierarchicalRedundancyComponent,
            NoLabelResourceComponent,
            OnlyAltLabelResourceComponent,
            OverlappedLabelComponent,
            NoLangLabelComponent,
            DanglingXLabelComponent,
            ImportDataComponent,
            ExportDataComponent,
            MetadataManagementComponent,
            VocbenchSettingsComponent,
            RegistrationComponent,
            TestComponent, //remove???

      ],
      bootstrap: [App],
})
export class AppModule { }
