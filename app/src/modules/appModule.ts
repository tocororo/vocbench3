import {NgModule} from '@angular/core';

import {Renderer} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {RouterModule} from "@angular/router";

import {STServicesModule} from "./stServicesModule";
import {SharedModule} from "./sharedModule";
import {VBModalModule} from "./vbModalModule";
import {TreeAndListModule} from "./treeAndListModule";
import {ResourceViewModule} from "./resourceViewModule";

import {ModalModule} from 'angular2-modal';
import {BootstrapModalModule} from 'angular2-modal/plugins/bootstrap';

import {AuthServices} from "../auth/authServices";

import {AppComponent} from "../appComponent";
import {appRouting} from '../appRoutes';

//Components
import {HomeComponent} from "../homeComponent";
import {ProjectComponent} from "../project/projectComponent";
import {ConceptsComponent} from "../skos/concept/conceptsComponent";
import {ClassComponent} from "../owl/classComponent";
import {PropertyComponent} from "../property/propertyComponent";
import {SchemesComponent} from "../skos/scheme/schemesComponent";
import {CollectionsComponent} from "../skos/collection/collectionsComponent";
import {SparqlComponent} from "../sparql/sparqlComponent";
import {AlignmentValidationComponent} from "../alignment/alignmentValidation/alignmentValidationComponent";
import {CustomRangeComponent} from "../customRanges/customRangeComponent";
import {ImportProjectComponent} from "../project/importProject/importProjectComponent";
import {CreateProjectComponent} from "../project/createProject/createProjectComponent";
import {IcvComponent} from "../icv/icvComponent";
import {DanglingConceptComponent} from "../icv/danglingConcept/danglingConceptComponent";
import {NoSchemeConceptComponent} from "../icv/noSchemeConcept/noSchemeConceptComponent";
import {NoTopConceptSchemeComponent} from "../icv/noTopConceptScheme/noTopConceptSchemeComponent";
import {TopConceptWithBroaderComponent} from "../icv/topConceptWithBroader/topConceptWithBroaderComponent";
import {HierarchicalRedundancyComponent} from "../icv/hierarchicalRedundancy/hierarchicalRedundancyComponent";
import {NoLabelResourceComponent} from "../icv/noLabelResource/noLabelResourceComponent";
import {OnlyAltLabelResourceComponent} from "../icv/onlyAltLabelResource/onlyAltLabelResourceComponent";
import {OverlappedLabelComponent} from "../icv/overlappedLabel/overlappedLabelComponent";
import {NoLangLabelComponent} from "../icv/noLangLabel/noLangLabelComponent";
import {DanglingXLabelComponent} from "../icv/danglingXLabel/danglingXLabelComponent";
import {ImportDataComponent} from "../config/dataManagement/importData/importDataComponent";
import {ExportDataComponent} from "../config/dataManagement/exportData/exportDataComponent";
import {MetadataManagementComponent} from "../config/dataManagement/metadata/metadataManagementComponent";
import {VocbenchSettingsComponent} from "../settings/vocbenchSettingsComponent";
import {RegistrationComponent} from "../user/registrationComponent";
import {TestComponent} from "../test/testComponent";

import {ConfigBarComponent} from "../config/configBar/configBarComponent";

@NgModule({
      imports: [
            BrowserModule, RouterModule, 
            FormsModule, //check if this is still necessary when declarated component are reduced in favor of more imported modules

            SharedModule, VBModalModule, TreeAndListModule, ResourceViewModule,
            STServicesModule,
            appRouting,
            ModalModule.forRoot(), BootstrapModalModule //Modules of angular2-modal
      ],
      //services with application scope
      providers: [
            AuthServices,
            Renderer, //needed form modal (maybe can be moved in a VBModalModule or wherever there are modals)
      ],
      declarations: [
            AppComponent,
            
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
            ImportDataComponent,
            ExportDataComponent,
            MetadataManagementComponent,
            VocbenchSettingsComponent,
            RegistrationComponent,
            TestComponent, //remove???

            ConfigBarComponent,

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
      ],
      bootstrap: [AppComponent],
})
export class AppModule { }
