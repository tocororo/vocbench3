import { Component } from "angular2/core";
import { bootstrap } from "angular2/platform/browser";
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, Location } from "angular2/router";
import { HTTP_PROVIDERS } from 'angular2/http';
import { ProjectComponent } from "./project/projectComponent";
import { ConceptsComponent } from "./skos/concept/conceptsComponent";
import { ClassComponent } from "./owl/classComponent";
import { PropertyComponent } from "./property/propertyComponent";
import { SchemesComponent } from "./skos/scheme/schemesComponent";
import { SparqlComponent } from "./sparql/sparqlComponent";
import { TestComponent } from "./test/testComponent";
import { HttpManager } from "./utils/HttpManager";
import { Deserializer } from "./utils/Deserializer";
import { STResponseUtils } from "./utils/STResponseUtils";
import { VocbenchCtx } from "./utils/VocbenchCtx";
import { VBEventHandler } from "./utils/VBEventHandler";

@Component({
	selector: "app",
    templateUrl: "app/src/app.html",
	directives: [ROUTER_DIRECTIVES], //tells which directives are used in the template
})

@RouteConfig([
	{path: "/Projects", name: "Projects", component: ProjectComponent, useAsDefault: true},
    {path: "/Class",    name: "Class",    component: ClassComponent},
    {path: "/Property", name: "Property", component: PropertyComponent},
    {path: "/Concepts", name: "Concepts", component: ConceptsComponent},
    {path: "/Schemes",  name: "Schemes",  component: SchemesComponent},
    {path: "/Sparql",   name: "Sparql",   component: SparqlComponent},
    {path: "/Test",     name: "Test",     component: TestComponent},
])

export class App {
    constructor(private location:Location, private vbCtx:VocbenchCtx) {}
    
    //returns true if viewLocation is the current view. Useful to apply "active" style to the navbar links 
    private isActive(viewLocation) {
        return this.location.path() == viewLocation;
    }
    
    //returns true if a project is open. Useful to enable/disable navbar links 
    private isProjectOpen() {
        return this.vbCtx.getProject() != "SYSTEM";
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