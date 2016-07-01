import {provideRouter, RouterConfig} from '@angular/router';

import {AuthGuard, ProjectGuard} from "./utils/CanActivateGuards";

import {HomeComponent} from "./homeComponent";
import {ProjectComponent} from "./project/projectComponent";
import {ConceptsComponent} from "./skos/concept/conceptsComponent";
import {ClassComponent} from "./owl/classComponent";
import {PropertyComponent} from "./property/propertyComponent";
import {SchemesComponent} from "./skos/scheme/schemesComponent";
import {CollectionsComponent} from "./skos/collection/collectionsComponent";
import {SparqlComponent} from "./sparql/sparqlComponent";
import {AlignmentValidationComponent} from "./alignment/alignmentValidation/alignmentValidationComponent";
import {CustomRangeComponent} from "./customRanges/customRangeComponent";
import {ImportProjectComponent} from "./project/importProject/importProjectComponent";
import {CreateProjectComponent} from "./project/createProject/createProjectComponent";

import {IcvComponent} from "./icv/icvComponent";
import {DanglingConceptComponent} from "./icv/danglingConcept/danglingConceptComponent";
import {NoSchemeConceptComponent} from "./icv/noSchemeConcept/noSchemeConceptComponent";
import {NoTopConceptSchemeComponent} from "./icv/noTopConceptScheme/noTopConceptSchemeComponent";
import {TopConceptWithBroaderComponent} from "./icv/topConceptWithBroader/topConceptWithBroaderComponent";
import {HierarchicalRedundancyComponent} from "./icv/hierarchicalRedundancy/hierarchicalRedundancyComponent";
import {NoLabelResourceComponent} from "./icv/noLabelResource/noLabelResourceComponent";
import {OnlyAltLabelResourceComponent} from "./icv/onlyAltLabelResource/onlyAltLabelResourceComponent";
import {OverlappedLabelComponent} from "./icv/overlappedLabel/overlappedLabelComponent";
import {NoLangLabelComponent} from "./icv/noLangLabel/noLangLabelComponent";
import {DanglingXLabelComponent} from "./icv/danglingXLabel/danglingXLabelComponent";

import {ImportDataComponent} from "./config/dataManagement/importData/importDataComponent";
import {ExportDataComponent} from "./config/dataManagement/exportData/exportDataComponent";
import {MetadataManagementComponent} from "./config/dataManagement/metadata/metadataManagementComponent";
import {VocbenchSettingsComponent} from "./settings/vocbenchSettingsComponent";
import {RegistrationComponent} from "./user/registrationComponent";

import {TestComponent} from "./test/testComponent";

export const routes: RouterConfig = [
    {path: "", redirectTo: "/Home", terminal: true},
    {path: "Home", component: HomeComponent},
    // route config of navigation bar
    {path: "Projects", component: ProjectComponent, canActivate: [AuthGuard]},
    {path: "Class", component: ClassComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Property", component: PropertyComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Concepts", component: ConceptsComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Schemes", component: SchemesComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Collections", component: CollectionsComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Sparql", component: SparqlComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv", component: IcvComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "AlignmentValidation", component: AlignmentValidationComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "CustomRange", component: CustomRangeComponent, canActivate: [AuthGuard]},
    {path: "Registration", component: RegistrationComponent},
    {path: "Settings", component: VocbenchSettingsComponent, canActivate: [AuthGuard]},
    {path: "Test", component: TestComponent, canActivate: [AuthGuard]},
    // route config of config bar
    {path: "Config/ImportData", component: ImportDataComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Config/ExportData", component: ExportDataComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Config/Metadata", component: MetadataManagementComponent, canActivate: [AuthGuard, ProjectGuard]},
    // route config for project management
    {path: "Projects", component: ProjectComponent, canActivate: [AuthGuard]},
    {path: "Projects/ImportProject", component: ImportProjectComponent, canActivate: [AuthGuard]},
    {path: "Projects/CreateProject", component: CreateProjectComponent, canActivate: [AuthGuard]},
    // route config of ICV
    {path: "Icv", component: IcvComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/DanglingConcept", component: DanglingConceptComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/NoSchemeConcept", component: NoSchemeConceptComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/NoTopConceptScheme", component: NoTopConceptSchemeComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/TopConceptWithBroader", component: TopConceptWithBroaderComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/HierarchicalRedundancy", component: HierarchicalRedundancyComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/NoLabelResource", component: NoLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/OnlyAltLabelResource", component: OnlyAltLabelResourceComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/OverlappedLabelResource", component: OverlappedLabelComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/NoLangLabelResource", component: NoLangLabelComponent, canActivate: [AuthGuard, ProjectGuard]},
    {path: "Icv/DanglingXLabel", component: DanglingXLabelComponent, canActivate: [AuthGuard, ProjectGuard]},
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];