import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AdministrationServices } from "../services/administrationServices";
import { AlignmentServices } from "../services/alignmentServices";
import { AuthServices } from "../services/authServices";
import { ClassesServices } from "../services/classesServices";
import { CODAServices } from "../services/codaServices";
import { CollaborationServices } from "../services/collaborationServices";
import { ConfigurationsServices } from "../services/configurationsServices";
import { CustomFormsServices } from "../services/customFormsServices";
import { CustomServiceServices } from '../services/customServiceServices';
import { DatasetCatalogsServices } from '../services/datasetCatalogsServices';
import { DatasetMetadataServices } from "../services/datasetMetadataServices";
import { DatatypesServices } from '../services/datatypesServices';
import { EdoalServices } from '../services/edoalServices';
import { ExportServices } from "../services/exportServices";
import { ExtensionsServices } from "../services/extensionsServices";
import { GraphServices } from '../services/graphServices';
import { HistoryServices } from "../services/historyServices";
import { IcvServices } from "../services/icvServices";
import { IndividualsServices } from "../services/individualsServices";
import { InputOutputServices } from "../services/inputOutputServices";
import { ManchesterServices } from "../services/manchesterServices";
import { MapleServices } from '../services/mapleServices';
import { MetadataRegistryServices } from "../services/metadataRegistryServices";
import { MetadataServices } from "../services/metadataServices";
import { OntoLexLemonServices } from "../services/ontoLexLemonServices";
import { OntoManagerServices } from "../services/ontoManagerServices";
import { PluginsServices } from "../services/pluginsServices";
import { PreferencesSettingsServices } from "../services/preferencesSettingsServices";
import { ProjectServices } from "../services/projectServices";
import { PropertyServices } from "../services/propertyServices";
import { RefactorServices } from "../services/refactorServices";
import { RemoteAlignmentServices } from '../services/remoteAlignmentServices';
import { RepositoriesServices } from "../services/repositoriesServices";
import { ResourcesServices } from "../services/resourcesServices";
import { ResourceViewServices } from "../services/resourceViewServices";
import { SearchServices } from "../services/searchServices";
import { ServicesServices } from "../services/servicesServices";
import { SettingsServices } from "../services/settingsServices";
import { ShaclServices } from '../services/shaclServices';
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { SkosServices } from "../services/skosServices";
import { SkosxlServices } from "../services/skosxlServices";
import { SparqlServices } from "../services/sparqlServices";
import { UserServices } from "../services/userServices";
import { UsersGroupsServices } from "../services/usersGroupsServices";
import { ValidationServices } from "../services/validationServices";
import { VersionsServices } from "../services/versionsServices";

@NgModule({
    imports: [HttpModule],
    declarations: [],
    exports: [],
    providers: [
        AdministrationServices,
        AlignmentServices,
        AuthServices,
        ClassesServices,
        CODAServices,
        CollaborationServices,
        ConfigurationsServices,
        CustomFormsServices,
        CustomServiceServices,
        DatatypesServices,
        DatasetCatalogsServices,
        DatasetMetadataServices,
        EdoalServices,
        ExportServices,
        ExtensionsServices,
        GraphServices,
        HistoryServices,
        IcvServices,
        IndividualsServices,
        InputOutputServices,
        ManchesterServices,
        MapleServices,
        MetadataServices,
        MetadataRegistryServices,
        OntoLexLemonServices,
        OntoManagerServices,
        PluginsServices,
        PreferencesSettingsServices,
        ProjectServices,
        PropertyServices,
        RefactorServices,
        RemoteAlignmentServices,
        RepositoriesServices,
        ResourcesServices,
        ResourceViewServices,
        SearchServices,
        ServicesServices,
        SettingsServices,
        ShaclServices,
        Sheet2RDFServices,
        SkosServices,
        SkosxlServices,
        SparqlServices,
        UserServices,
        UsersGroupsServices,
        ValidationServices,
        VersionsServices
    ]
})
export class STServicesModule { }