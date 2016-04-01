import { Component } from "angular2/core";
import { RouteConfig, ROUTER_DIRECTIVES, Location } from "angular2/router";
import { VocbenchCtx } from "./utils/VocbenchCtx";
import { ProjectComponent } from "./project/projectComponent";
import { ConceptsComponent } from "./skos/concept/conceptsComponent";
import { ClassComponent } from "./owl/classComponent";
import { PropertyComponent } from "./property/propertyComponent";
import { SchemesComponent } from "./skos/scheme/schemesComponent";
import { SparqlComponent } from "./sparql/sparqlComponent";
import { IcvComponent } from "./icv/icvComponent";
import { ImportProjectComponent } from "./project/importProject/importProjectComponent";
import { CreateProjectComponent } from "./project/createProject/createProjectComponent";
import { DanglingConceptComponent } from "./icv/danglingConcept/danglingConceptComponent";
import { NoSchemeConceptComponent } from "./icv/noSchemeConcept/noSchemeConceptComponent";
import { NoTopConceptSchemeComponent } from "./icv/noTopConceptScheme/noTopConceptSchemeComponent";
import { TopConceptWithBroaderComponent } from "./icv/topConceptWithBroader/topConceptWithBroaderComponent";
import { HierarchicalRedundancyComponent } from "./icv/hierarchicalRedundancy/hierarchicalRedundancyComponent";
import { ConfigBarComponent } from "./config/configBar/configBarComponent";
import { ImportDataComponent } from "./config/dataManagement/importData/importDataComponent";
import { ExportDataComponent } from "./config/dataManagement/exportData/exportDataComponent";
import { RegistrationComponent } from "./user/registrationComponent";

import { TestComponent } from "./test/testComponent";

@Component({
    selector: "app",
    templateUrl: "app/src/app.html",
    directives: [ROUTER_DIRECTIVES, ConfigBarComponent],
})

@RouteConfig([
    // route config of navigation bar
    {path: "/Projects", name: "Projects", component: ProjectComponent, useAsDefault: true},
    {path: "/Class", name: "Class", component: ClassComponent},
    {path: "/Property", name: "Property", component: PropertyComponent},
    {path: "/Concepts", name: "Concepts", component: ConceptsComponent},
    {path: "/Schemes", name: "Schemes", component: SchemesComponent},
    {path: "/Sparql", name: "Sparql", component: SparqlComponent},
    {path: "/Icv", name: "Icv", component: IcvComponent},
    {path: "/Test", name: "Test", component: TestComponent},
    {path: "/Registration", name: "Registration", component: RegistrationComponent},
    // route config of config bar
    {path: "/Config/ImportData", name: "ImportData", component: ImportDataComponent},
    {path: "/Config/ExportData", name: "ExportData", component: ExportDataComponent},
    // route config for project management
    {path: "/Projects/ImportProject", name: "ImportProject", component: ImportProjectComponent},
    {path: "/Projects/CreateProject", name: "CreateProject", component: CreateProjectComponent},
    // route config of ICV
    {path: "/Icv/DanglingConcept", name: "DanglingConcept", component: DanglingConceptComponent},
    {path: "/Icv/NoSchemeConcept", name: "NoSchemeConcept", component: NoSchemeConceptComponent},
    {path: "/Icv/NoTopConceptScheme", name: "NoTopConceptScheme", component: NoTopConceptSchemeComponent},
    {path: "/Icv/TopConceptWithBroader", name: "TopConceptWithBroader", component: TopConceptWithBroaderComponent},
    {path: "/Icv/HierarchicalRedundancy", name: "HierarchicalRedundancy", component: HierarchicalRedundancyComponent},
])

export class App {
    
    constructor(private location:Location, private vbCtx:VocbenchCtx) {}
    
    /**
     * returns true if viewLocation is the current view. Useful to apply "active" style to the navbar links
     */ 
    private isActive(viewLocation): boolean {
        return this.location.path() == viewLocation;
    }
    
    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        return this.vbCtx.getProject() != undefined;
    }
    
    /**
     * returns true if a project is SKOS or SKOS-XL. Useful to show/hide navbar links available only in SKOS (ex. concept, scheme)
     */
    private isProjectSKOS(): boolean {
        return (this.vbCtx.getProject().getPrettyPrintOntoType().indexOf("SKOS") > -1);
    }
    
    /**
     * returns true if a project is OWL. Useful to show/hide navbar links available only in OWL (ex. class)
     */
    private isProjectOWL(): boolean {
        return (this.vbCtx.getProject().getPrettyPrintOntoType() == "OWL");
    }
    
}