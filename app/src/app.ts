import { Component, provide } from "angular2/core";
import { bootstrap } from "angular2/platform/browser";
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from "angular2/router";
import { HTTP_PROVIDERS } from 'angular2/http';
import { ProjectComponent } from "./project/projectComponent";
import { ConceptsComponent } from "./skos/conceptsComponent";
import { SchemesComponent } from "./skos/scheme/schemesComponent";
import { HttpManager } from "./utils/HttpManager";
import { VocbenchCtx } from "./utils/VocbenchCtx";

@Component({
	selector: "app",
    templateUrl: "app/src/app.html",
	directives: [ROUTER_DIRECTIVES], //tells which directives are used in the template
})

@RouteConfig([
	{path: "/Projects", name: "Projects", component: ProjectComponent, useAsDefault: true},
    {path: "/Concepts", name: "Concepts", component: ConceptsComponent},
    {path: "/Class",    name: "Class",    component: ProjectComponent},
    {path: "/Schemes",  name: "Schemes",  component: SchemesComponent},
    {path: "/Sparql",   name: "Sparql",   component: ProjectComponent},
    {path: "/Test",     name: "Test",     component: ProjectComponent},
])

export class App {
	
}

bootstrap(App, [
	ROUTER_PROVIDERS, HTTP_PROVIDERS,
    HttpManager, VocbenchCtx
]); 
/** 
 * 2nd argument is an array of injectable that are widely provided to components
 */