import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CustomReuseStrategy } from '../a2Customization/CustomReuseStrategy';
import { AppComponent } from '../appComponent';
import { AppRoutingModule } from '../appRoutes';
import { DataComponent } from '../data/dataComponent';
import { HomeComponent } from '../homeComponent';
import { SkosDiffingModule } from '../skosDiffing/skosDiffingModule';
import { UndoDirective } from '../undo/undoDirective';
import { UndoHandler } from '../undo/undoHandler';
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
import { GlobalDataMgmtModule } from './globalDataMgmtModule';
import { GraphModule } from './graphModule';
import { HistoryValidationModule } from './historyValidationModule';
import { IcvModule } from './icvModule';
import { MetadataModule } from './metadataModule';
import { NotificationsModule } from './notificationsModule';
import { PreferencesModule } from './preferencesModule';
import { ProjectModule } from './projectModule';
import { ResourceMetadataModule } from './resourceMetadataModule';
import { ResourceViewModule } from './resourceViewModule';
import { ShaclModule } from './ShaclModule';
import { SharedModule } from './sharedModule';
import { Sheet2RdfModule } from './sheet2rdfModule';
import { SparqlModule } from './sparqlModule';
import { STServicesModule } from './stServicesModule';
import { TreeAndListModule } from './treeAndListModule';
import { UserModule } from './userModule';
import { VBModalModule } from './vbModalModule';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/l10n/");
}

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        NgbModule,
        TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),

        AppRoutingModule,

        AdministrationModule,
        AlignmentModule,
        CollaborationModule,
        CustomFormModule,
        CustomServicesModule,
        DatasetCatalogModule,
        EdoalModule,
        GlobalDataMgmtModule,
        GraphModule,
        HistoryValidationModule,
        IcvModule,
        MetadataModule,
        NotificationsModule,
        PreferencesModule,
        ProjectModule,
        ResourceMetadataModule,
        ResourceViewModule,
        ShaclModule,
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
        UndoHandler,
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
        HomeComponent,
        DataComponent,
        UndoDirective
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
