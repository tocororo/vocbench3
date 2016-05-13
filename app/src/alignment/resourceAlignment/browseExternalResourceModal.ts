import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {Project} from "../../utils/Project";
import {ProjectServices} from "../../services/projectServices";
import {ClassTreeComponent} from "../../owl/classTree/classTreeComponent";
import {ClassIndividualTreeComponent} from "../../owl/classIndividualTree/classIndividualTreeComponent";
import {ConceptTreeComponent} from "../../skos/concept/conceptTree/conceptTreeComponent";
import {SchemeListComponent} from "../../skos/scheme/schemeList/schemeListComponent";
import {PropertyTreeComponent} from "../../property/propertyTree/propertyTreeComponent";

export class BrowseExternalResourceModalData extends BSModalContext {
    /**
     * @param title title of the modal
     * @param resRole role of the resource to explore.
     */
    constructor(public title: string, public resRole: RDFResourceRolesEnum) {
        super();
    }
}

@Component({
    selector: "browse-external-resource-modal",
    templateUrl: "app/src/alignment/resourceAlignment/browseExternalResourceModal.html",
    providers: [ProjectServices],
    directives: [ClassTreeComponent, ClassIndividualTreeComponent, ConceptTreeComponent,
        PropertyTreeComponent, SchemeListComponent]
})
export class BrowseExternalResourceModal implements ModalComponent<BrowseExternalResourceModalData> {
    context: BrowseExternalResourceModalData;
    
    private projectList: Array<Project> = [];
    private project: Project;
    private alignedObject: ARTURIResource;
    
    
    constructor(public dialog: DialogRef<BrowseExternalResourceModalData>, 
        public vbCtx: VocbenchCtx, public projService: ProjectServices) {
            
        this.context = dialog.context;
    }
    
    ngOnInit() {
        //toFocus2 cause this modal is open from another modal that have already an id "toFocus"
        document.getElementById("toFocus2").focus(); 
        
        this.projService.listProjects().subscribe(
            projects => {
                //keep only the projects (different from the current) compliant with the resource role to align
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].getName() != this.vbCtx.getWorkingProject().getName()) {
                        var ontoType: string = projects[i].getPrettyPrintOntoType()
                        if (this.context.resRole == RDFResourceRolesEnum.concept && ontoType.includes("SKOS")) {
                            this.projectList.push(projects[i]);
                        } else if (this.context.resRole == RDFResourceRolesEnum.conceptScheme && ontoType.includes("SKOS")) {
                            this.projectList.push(projects[i]);
                        } else if (this.context.resRole == RDFResourceRolesEnum.cls && ontoType == "OWL") {
                            this.projectList.push(projects[i]);
                        } else if (this.context.resRole == RDFResourceRolesEnum.property) {
                            this.projectList.push(projects[i]);
                        } else if (this.context.resRole == RDFResourceRolesEnum.individual && ontoType == "OWL") {
                            this.projectList.push(projects[i]);
                        }
                    }
                }
            }
        );
    }
    
    private onProjectChange() {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.vbCtx.removeContextProject();
        this.projService.accessProject(this.project).subscribe(
            stResp => {
                this.vbCtx.setContextProject(this.project);
                document.getElementById("blockDivFullScreen").style.display = "none";
            },
            () => document.getElementById("blockDivFullScreen").style.display = "none"
        );
        this.alignedObject = null;
    }
    
    /**
     * Listener called when a resource of a tree is selected
     */
    private onResourceSelected(resource: ARTURIResource) {
        this.alignedObject = resource;
    }
    
    /**
     * Listener called when it's aligning concept and the scheme in the concept tree is changed
     */
    private onSchemeChanged() {
        this.alignedObject = null;
    }
    
    private showClassTree(): boolean {
        return (this.context.resRole == RDFResourceRolesEnum.cls && this.vbCtx.getContextProject() != undefined);
    }
    private showConceptTree(): boolean {
        return (this.context.resRole == RDFResourceRolesEnum.concept && this.vbCtx.getContextProject() != undefined);
    }
    private showPropertyTree(): boolean {
        return (this.context.resRole == RDFResourceRolesEnum.property && this.vbCtx.getContextProject() != undefined);
    }
    private showSchemeList(): boolean {
        return (this.context.resRole == RDFResourceRolesEnum.conceptScheme && this.vbCtx.getContextProject() != undefined);
    }
    private showClassIndividualTree(): boolean {
        return (this.context.resRole == RDFResourceRolesEnum.individual && this.vbCtx.getContextProject() != undefined);
    }
    
    private isOkClickable(): boolean {
        return this.alignedObject != undefined;
    }
    
    ok(event) {
        this.vbCtx.removeContextProject();
        event.stopPropagation();
        this.dialog.close(this.alignedObject);
    }
    
    cancel() {
        this.vbCtx.removeContextProject();
        this.dialog.dismiss();
    }

}