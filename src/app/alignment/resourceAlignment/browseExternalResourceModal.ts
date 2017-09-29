import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { HttpServiceContext } from "../../utils/HttpManager";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { Project } from "../../models/Project";
import { SKOS } from "../../models/Vocabulary";
import { ProjectServices } from "../../services/projectServices";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";

@Component({
    selector: "browse-external-resource-modal",
    templateUrl: "./browseExternalResourceModal.html",
})
export class BrowseExternalResourceModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private projectList: Array<Project> = [];
    private project: Project;
    private schemes: ARTURIResource[]; //scheme to explore in case target project is skos(xl)
    private alignedObject: ARTURIResource;

    private activeView: RDFResourceRolesEnum;


    constructor(public dialog: DialogRef<BSModalContext>, public projService: ProjectServices,
        private preferenceService: PreferencesSettingsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.projService.listProjects(VBContext.getWorkingProject(), true, true).subscribe(
            projects => {
                //keep only the projects (different from the current) compliant with the resource role to align
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].isOpen() && projects[i].getName() != VBContext.getWorkingProject().getName()) {
                        this.projectList.push(projects[i])
                    }
                }
            }
        );
    }

    private onProjectChange() {
        HttpServiceContext.removeContextProject();
        HttpServiceContext.setContextProject(this.project);
        this.activeView = null;
        this.alignedObject = null;
        
        if (this.isProjectSKOS()) {
            this.preferenceService.getActiveSchemes(this.project.getName()).subscribe(
                schemes => {
                    this.schemes = schemes;
                }
            );
        }
    }

    private onAlignTypeChanged() {
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

    private isProjectSKOS(): boolean {
        return this.project.getModelType() == SKOS.uri;
    }

    private isOkClickable(): boolean {
        return this.alignedObject != undefined;
    }

    ok(event: Event) {
        HttpServiceContext.removeContextProject();
        event.stopPropagation();
        this.dialog.close(this.alignedObject);
    }

    cancel() {
        HttpServiceContext.removeContextProject();
        this.dialog.dismiss();
    }

}