import {NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {RouterModule} from "@angular/router";
import {HttpModule} from '@angular/http';

import {Renderer} from "@angular/core";

import {ModalModule} from 'angular2-modal';
import {BootstrapModalModule} from 'angular2-modal/plugins/bootstrap';

import {HttpManager} from "./src/utils/HttpManager";
import {VocbenchCtx} from "./src/utils/VocbenchCtx";
import {VBEventHandler} from "./src/utils/VBEventHandler";
import {GUARD_PROVIDERS} from "./src/utils/CanActivateGuards";
import {ModalServices} from "./src/widget/modal/modalServices";
import {AuthServices} from "./src/auth/authServices";

import {App} from "./src/app";
import {appRouting} from './src/appRoutes';

//ST Services
import {AdministrationServices} from "./src/services/administrationServices";
import {AlignmentServices} from "./src/services/alignmentServices";
import {CustomRangeServices} from "./src/services/customRangeServices";
import {DeleteServices} from "./src/services/deleteServices";
import {IcvServices} from "./src/services/icvServices";
import {InputOutputServices} from "./src/services/inputOutputServices";
import {ManchesterServices} from "./src/services/manchesterServices";
import {MetadataServices} from "./src/services/metadataServices";
import {OntoManagerServices} from "./src/services/ontoManagerServices";
import {OwlServices} from "./src/services/owlServices";
import {PluginsServices} from "./src/services/pluginsServices";
import {ProjectServices} from "./src/services/projectServices";
import {PropertyServices} from "./src/services/propertyServices";
import {RefactorServices} from "./src/services/refactorServices";
import {ResourceServices} from "./src/services/resourceServices";
import {ResourceViewServices} from "./src/services/resourceViewServices";
import {SearchServices} from "./src/services/searchServices";
import {SkosServices} from "./src/services/skosServices";
import {SkosxlServices} from "./src/services/skosxlServices";
import {SparqlServices} from "./src/services/sparqlServices";

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

//Modal entry
import {CustomModal} from "./src/widget/modal/custom-modal-sample";


@NgModule({
  imports: [ BrowserModule, FormsModule, HttpModule, RouterModule, 
        appRouting,
        ModalModule.forRoot(), BootstrapModalModule
  ],
  providers: [
        HttpManager, VocbenchCtx, VBEventHandler,
        AuthServices, GUARD_PROVIDERS,
      //   BS_MODAL_PROVIDERS, Renderer, MODAL_BROWSER_PROVIDERS, //required in order to add ModalServices as provider
        ModalServices,

        //ST services
        AdministrationServices,
        AlignmentServices,
        CustomRangeServices,
        DeleteServices,
        IcvServices,
        InputOutputServices,
        ManchesterServices,
        MetadataServices,
        OntoManagerServices,
        OwlServices,
        PluginsServices,
        ProjectServices,
        PropertyServices,
        RefactorServices,
        ResourceServices,
        ResourceViewServices,
        SearchServices,
        SkosServices,
        SkosxlServices,
        SparqlServices
  ],
  declarations: [ App,
        HomeComponent,
        ProjectComponent,
        ConceptsComponent,
        ClassComponent,
        PropertyComponent,
        SchemesComponent,
        CollectionsComponent,
        SparqlComponent,
        AlignmentValidationComponent,
        CustomRangeComponent,
        ImportProjectComponent,
        CreateProjectComponent,
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
        TestComponent //remove???
  ],
  bootstrap: [ App ],


  // IMPORTANT: 
  // Since 'AdditionCalculateWindow' is never explicitly used (in a template)
  // we must tell angular about it.
  entryComponents: [ CustomModal ]
})
export class AppModule { }
