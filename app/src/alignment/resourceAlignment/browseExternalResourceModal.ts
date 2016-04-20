import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {RDFResourceRolesEnum} from "../../utils/Enums";
import {Project} from "../../utils/Project";
import {ProjectServices} from "../../services/projectServices";
import {ClassTreeComponent} from "../../owl/classTree/classTreeComponent";
import {ConceptTreeComponent} from "../../skos/concept/conceptTree/conceptTreeComponent";
import {SchemeListComponent} from "../../skos/scheme/schemeList/schemeListComponent";
import {PropertyTreeComponent} from "../../property/propertyTree/propertyTreeComponent";

export class BrowseExternalResourceModalContent {
    /**
     * @param title title of the modal
     * @param resRole role of the resource to explore.
     */
    constructor(public title: string, public resRole: RDFResourceRolesEnum) {}
}

@Component({
    selector: "browse-external-resource-modal",
    templateUrl: "app/src/alignment/resourceAlignment/browseExternalResourceModal.html",
    providers: [ProjectServices],
    directives: [ClassTreeComponent, ConceptTreeComponent, PropertyTreeComponent, SchemeListComponent]
})
export class BrowseExternalResourceModal implements ICustomModalComponent {
    
    private projectList: Array<Project> = [];
    private project: Project;
    private alignedObject: ARTURIResource;
    
    dialog: ModalDialogInstance;
    context: BrowseExternalResourceModalContent;
    vbCtx: VocbenchCtx;
    projService: ProjectServices;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal, vbCtx: VocbenchCtx, projService: ProjectServices) {
        this.dialog = dialog;
        this.context = <BrowseExternalResourceModalContent>modelContentData;
        this.vbCtx = vbCtx;
        this.projService = projService;
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
                        } else if (this.context.resRole == RDFResourceRolesEnum.individual) {
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
            }
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