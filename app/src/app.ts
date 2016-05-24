import { Component, ViewContainerRef } from "@angular/core";
import { RouteConfig, ROUTER_DIRECTIVES, Router } from "@angular/router-deprecated";
import { Location } from "@angular/common";

import { VocbenchCtx } from "./utils/VocbenchCtx";
import { VBEventHandler } from "./utils/VBEventHandler";
import { HomeComponent } from "./homeComponent";
import { ProjectComponent } from "./project/projectComponent";
import { ConceptsComponent } from "./skos/concept/conceptsComponent";
import { ClassComponent } from "./owl/classComponent";
import { PropertyComponent } from "./property/propertyComponent";
import { SchemesComponent } from "./skos/scheme/schemesComponent";
import { SparqlComponent } from "./sparql/sparqlComponent";
import { IcvComponent } from "./icv/icvComponent";
import { AlignmentValidationComponent } from "./alignment/alignmentValidation/alignmentValidationComponent";
import { CustomRangeComponent } from "./customRanges/customRangeComponent";
import { ImportProjectComponent } from "./project/importProject/importProjectComponent";
import { CreateProjectComponent } from "./project/createProject/createProjectComponent";
import { DanglingConceptComponent } from "./icv/danglingConcept/danglingConceptComponent";
import { NoSchemeConceptComponent } from "./icv/noSchemeConcept/noSchemeConceptComponent";
import { NoTopConceptSchemeComponent } from "./icv/noTopConceptScheme/noTopConceptSchemeComponent";
import { TopConceptWithBroaderComponent } from "./icv/topConceptWithBroader/topConceptWithBroaderComponent";
import { HierarchicalRedundancyComponent } from "./icv/hierarchicalRedundancy/hierarchicalRedundancyComponent";
import { NoLabelResourceComponent } from "./icv/noLabelResource/noLabelResourceComponent";
import { ConfigBarComponent } from "./config/configBar/configBarComponent";
import { ImportDataComponent } from "./config/dataManagement/importData/importDataComponent";
import { ExportDataComponent } from "./config/dataManagement/exportData/exportDataComponent";
import { MetadataManagementComponent } from "./config/dataManagement/metadata/metadataManagementComponent";
import { RegistrationComponent } from "./user/registrationComponent";

//import to open modal to change content language (Remove if the modal will be launched from another component)
import { Modal } from 'angular2-modal/plugins/bootstrap';
import { ContentLangModal, ContentLangModalData } from "./settings/contentLang/contentLangModal";

import { TestComponent } from "./test/testComponent";

@Component({
    selector: "app",
    templateUrl: "app/src/app.html",
    directives: [ROUTER_DIRECTIVES, ConfigBarComponent],
})

@RouteConfig([
    {path: "/", name: "Home", component: HomeComponent, useAsDefault: true},
    // route config of navigation bar
    {path: "/Projects", name: "Projects", component: ProjectComponent},
    {path: "/Class", name: "Class", component: ClassComponent},
    {path: "/Property", name: "Property", component: PropertyComponent},
    {path: "/Concepts", name: "Concepts", component: ConceptsComponent},
    {path: "/Schemes", name: "Schemes", component: SchemesComponent},
    {path: "/Sparql", name: "Sparql", component: SparqlComponent},
    {path: "/Icv", name: "Icv", component: IcvComponent},
    {path: "/AlignmentValidation", name: "AlignmentValidation", component: AlignmentValidationComponent},
    {path: "/CustomRange", name: "CustomRange", component: CustomRangeComponent},
    {path: "/Test", name: "Test", component: TestComponent},
    {path: "/Registration", name: "Registration", component: RegistrationComponent},
    // route config of config bar
    {path: "/Config/ImportData", name: "ImportData", component: ImportDataComponent},
    {path: "/Config/ExportData", name: "ExportData", component: ExportDataComponent},
    {path: "/Config/Metadata", name: "Metadata", component: MetadataManagementComponent},
    // route config for project management
    {path: "/Projects/ImportProject", name: "ImportProject", component: ImportProjectComponent},
    {path: "/Projects/CreateProject", name: "CreateProject", component: CreateProjectComponent},
    // route config of ICV
    {path: "/Icv/DanglingConcept", name: "DanglingConcept", component: DanglingConceptComponent},
    {path: "/Icv/NoSchemeConcept", name: "NoSchemeConcept", component: NoSchemeConceptComponent},
    {path: "/Icv/NoTopConceptScheme", name: "NoTopConceptScheme", component: NoTopConceptSchemeComponent},
    {path: "/Icv/TopConceptWithBroader", name: "TopConceptWithBroader", component: TopConceptWithBroaderComponent},
    {path: "/Icv/HierarchicalRedundancy", name: "HierarchicalRedundancy", component: HierarchicalRedundancyComponent},
    {path: "/Icv/NoLabelResource/:type", name: "NoLabelResource", component: NoLabelResourceComponent},
])

export class App {
    
    constructor(private location:Location, private router: Router, private vbCtx:VocbenchCtx, private evtHandler: VBEventHandler,
        private modal: Modal, viewContainer: ViewContainerRef) {
        /**
         * A Default view container ref, usually the app root container ref.
         * Has to be set manually until we can find a way to get it automatically.
         */
        modal.defaultViewContainer = viewContainer;    
    }
    
    /**
     * returns true if viewLocation is the current view. Useful to apply "active" style to the navbar links
     */ 
    private isActive(viewLocation): boolean {
        return this.location.path() == viewLocation;
    }
    
    /**
     * Returns true if the user is logged (an authentication token is stored)
     */
    private isUserLogged(): boolean {
        return this.vbCtx.getAuthenticationToken() != undefined;
    }
    
    /**
     * Removes the authentication token and redirect to home page
     */
    private logout() {
        this.vbCtx.removeAutheticationToken();
        this.router.navigate(["Home"]);
    }
    
    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        return this.vbCtx.getWorkingProject() != undefined;
    }
    
    /**
     * returns true if a project is SKOS or SKOS-XL. Useful to show/hide navbar links available only in SKOS (ex. concept, scheme)
     */
    private isProjectSKOS(): boolean {
        return (this.vbCtx.getWorkingProject().getPrettyPrintOntoType().indexOf("SKOS") > -1);
    }
    
    /**
     * returns true if a project is OWL. Useful to show/hide navbar links available only in OWL (ex. class)
     */
    private isProjectOWL(): boolean {
        return (this.vbCtx.getWorkingProject().getPrettyPrintOntoType() == "OWL");
    }
    
    
    //---- User drobdown menu ----
    /*this logic cannot be moved in a dedicated (user menu) component since the component,
      would add an element (likely <user-menu>) between the <ul class="nav navbar-nav navbar-right"> and
      <li class="dropdown"> elements */ 
     
    /**
     * When user selects "content language" menu item. Opens the modal to change the content language.
     */
    private changeContentLang() {
        this.modal.open(ContentLangModal, new ContentLangModalData()).then(
            dialog => 
                dialog.result.then(
                    confirmed => {},
                    canceled => {}
                )
            );
    }
    
    /**
     * Determines the status of the checkbox in the "content language" menu item.
     */
    private isHumanReadable(): boolean {
        return this.vbCtx.getHumanReadable();
    }
    
    /**
     * Listener to click event of the human readable checkbox in the "content language" menu item.
     * Updates the humanReadable setting and emits a contentLangChangedEvent.
     * N.B. this method listens the click event, and NOT the change, because it needs to intercept the click on the menu item 
     * and stop the propagation to prevent to open ContentLangModal  
     */
    private switchHumanReadable(humanReadable: boolean, event: Event) {
        event.stopPropagation();
        this.vbCtx.setHumanReadable(humanReadable);
        if (humanReadable) {
            this.evtHandler.contentLangChangedEvent.emit(this.vbCtx.getContentLanguage());
        } else {
            this.evtHandler.contentLangChangedEvent.emit(null);
        }
    }
    
}