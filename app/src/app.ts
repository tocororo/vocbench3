import { Component } from "angular2/core";
import { bootstrap } from "angular2/platform/browser";
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, Location } from "angular2/router";
import { HTTP_PROVIDERS } from "angular2/http";
import { ProjectComponent } from "./project/projectComponent";
import { ConceptsComponent } from "./skos/concept/conceptsComponent";
import { ClassComponent } from "./owl/classComponent";
import { PropertyComponent } from "./property/propertyComponent";
import { SchemesComponent } from "./skos/scheme/schemesComponent";
import { SparqlComponent } from "./sparql/sparqlComponent";
import { IcvComponent } from "./icv/icvComponent";
import { DanglingConceptComponent } from "./icv/danglingConcept/danglingConceptComponent";
import { NoSchemeConceptComponent } from "./icv/noSchemeConcept/noSchemeConceptComponent";
import { NoTopConceptSchemeComponent } from "./icv/noTopConceptScheme/noTopConceptSchemeComponent";
import { ConfigBarComponent } from "./config/configBar/configBarComponent";
import { ImportDataComponent } from "./config/dataManagement/importData/importDataComponent";
import { ExportDataComponent } from "./config/dataManagement/exportData/exportDataComponent";
import { TestComponent } from "./test/testComponent";
import { HttpManager } from "./utils/HttpManager";
import { Deserializer } from "./utils/Deserializer";
import { STResponseUtils } from "./utils/STResponseUtils";
import { VocbenchCtx } from "./utils/VocbenchCtx";
import { VBEventHandler } from "./utils/VBEventHandler";

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
    // route config of config bar
    {path: "/Config/ImportData", name: "ImportData", component: ImportDataComponent},
    {path: "/Config/ExportData", name: "ExportData", component: ExportDataComponent},
    // route config of ICV
    {path: "/Icv/DanglingConcept", name: "DanglingConcept", component: DanglingConceptComponent},
    {path: "/Icv/NoSchemeConcept", name: "NoSchemeConcept", component: NoSchemeConceptComponent},
    {path: "/Icv/NoTopConceptScheme", name: "NoTopConceptScheme", component: NoTopConceptSchemeComponent},
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

bootstrap(App, [
	ROUTER_PROVIDERS, HTTP_PROVIDERS,
    HttpManager, VocbenchCtx, VBEventHandler, STResponseUtils, Deserializer
]);
/**
 * 2nd argument is an array of providers injectable 
 * Providers can be injected punctually in a Component if needed (using the proviers: [] array), or
 * in the bootstrap function so that they can be widely used in the application, without specifying them in providers
 */