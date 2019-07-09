import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { Project } from "../models/Project";
import { OntoLex, SKOS, RDFS, OWL } from "../models/Vocabulary";
import { AdministrationServices } from "../services/administrationServices";
import { ProjectContext, VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { EdoalServices } from "../services/edoalServices";
import { ProjectServices } from "../services/projectServices";

@Component({
    selector: "edoal-component",
    templateUrl: "./edoalComponent.html",
    host: { class: "pageComponent" }
})
export class EdoalComponent {

    private contextInitialized: boolean = false;

    private leftProjCtx: ProjectContext;
    private leftSelectedResource: ARTURIResource = null;
    private rightProjCtx: ProjectContext;
    private rightSelectedResource: ARTURIResource = null;

    private leftHiddenTabs: RDFResourceRolesEnum[] = [];
    private rightHiddenTabs: RDFResourceRolesEnum[] = [];

    constructor(private adminService: AdministrationServices, private edoalService: EdoalServices, private projectService: ProjectServices,
        private vbProp: VBProperties, private sharedModals: SharedModalServices) {}

    
    ngOnInit() {

        this.edoalService.getAlignedProjects().subscribe(
            projects => {
                let leftProjectName: string = projects[0];
                let rightProjectName: string = projects[1];
                //TEMP, just for test
                // let leftProjectName: string = "skosxl";
                // let rightProjectName: string = "Ontolex";

                let leftProject: Project = new Project(leftProjectName);
                let rightProject: Project = new Project(rightProjectName);

                let describeProjFn: Observable<any>[] = [
                    this.projectService.getProjectInfo(leftProjectName).map(
                        proj => {
                            leftProject = proj;
                            this.leftHiddenTabs = this.getHiddenTabs(leftProject);
                        }
                    ),
                    this.projectService.getProjectInfo(rightProjectName).map(
                        proj => {
                            rightProject = proj;
                            this.rightHiddenTabs = this.getHiddenTabs(rightProject);
                        }
                    )
                ];

                Observable.forkJoin(describeProjFn).subscribe(
                    () => {
                        this.leftProjCtx = new ProjectContext();
                        this.leftProjCtx.setProject(leftProject);
                        let initLeftProjectCtxFn: Observable<void>[] = [
                            this.getInitProjectUserBindingFn(this.leftProjCtx),
                            this.vbProp.initUserProjectPreferences(this.leftProjCtx)
                        ];

                        this.rightProjCtx = new ProjectContext();
                        this.rightProjCtx.setProject(rightProject);
                        let initRightProjectCtxFn: Observable<void>[] = [
                            this.getInitProjectUserBindingFn(this.rightProjCtx),
                            this.vbProp.initUserProjectPreferences(this.rightProjCtx)
                        ];

                        Observable.forkJoin(...initLeftProjectCtxFn, ...initRightProjectCtxFn).subscribe(
                            () => {
                                this.contextInitialized = true;
                            }
                        );
                    }
                );
            }
        );

    }

    private getHiddenTabs(project: Project): RDFResourceRolesEnum[] {
        let hiddenTabs: RDFResourceRolesEnum[] = [];
        if (project.getModelType() == RDFS.uri) {
            hiddenTabs.push(RDFResourceRolesEnum.dataRange);
        } else if (project.getModelType() == OWL.uri) {
            hiddenTabs.push(RDFResourceRolesEnum.dataRange);
        } else if (project.getModelType() == SKOS.uri) {
            hiddenTabs.push(...[RDFResourceRolesEnum.cls, RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.property, RDFResourceRolesEnum.dataRange])
        } else if (project.getModelType() == OntoLex.uri) {
            hiddenTabs.push(
                ...[RDFResourceRolesEnum.cls,  RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme,
                RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.property, RDFResourceRolesEnum.dataRange]
            );
        }
        return hiddenTabs;
    }

    private getInitProjectUserBindingFn(projectCtx: ProjectContext): Observable<void> {
        return this.adminService.getProjectUserBinding(projectCtx.getProject().getName(), VBContext.getLoggedUser().getEmail()).map(
            pub => {
                projectCtx.setProjectUserBinding(pub);
            }
        );
    }

    private openResourceView(res: ARTURIResource) {
        this.sharedModals.openResourceView(res, true);
    }

    private onLeftResourceSelected(resource: ARTURIResource) {
        this.leftSelectedResource = resource;
    }

    private onRightResourceSelected(resource: ARTURIResource) {
        this.rightSelectedResource = resource;
    }

}