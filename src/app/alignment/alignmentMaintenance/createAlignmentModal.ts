import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Project } from "../../models/Project";
import { ProjectServices } from "../../services/projectServices";
import { ProjectContext, VBContext } from "../../utils/VBContext";
import { HttpServiceContext } from "../../utils/HttpManager";
import { MapleServices } from "../../services/mapleServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { GenomaServices } from "../../services/genomaServices";

export class CreateAlignmentModalData extends BSModalContext {
    constructor(public leftProject: Project) {
        super();
    }
}

@Component({
    selector: "create-alignment-modal",
    templateUrl: "./createAlignmentModal.html",
})
export class CreateAlignmentModal implements ModalComponent<CreateAlignmentModalData> {
    context: CreateAlignmentModalData;

    private projectList: Project[];
    private selectedRightProject: Project;

    private leftProjectStruct: AlignedProjectStruct;
    private rightProjectStruct: AlignedProjectStruct;

    constructor(public dialog: DialogRef<CreateAlignmentModalData>, private projectService: ProjectServices,
        private mapleService: MapleServices, private genomaService: GenomaServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //TODO in production, 2nd parameter should be true? the target dataset should be user dependent?
        this.projectService.listProjects(VBContext.getWorkingProject(), false, true).subscribe(
            projects => {
                this.projectList = projects;
            }
        );
        this.leftProjectStruct = new AlignedProjectStruct();
        this.initProjectStruct(this.leftProjectStruct, this.context.leftProject);
    }

    private onRightProjectChange() {
        this.rightProjectStruct = new AlignedProjectStruct();
        this.initProjectStruct(this.rightProjectStruct, this.selectedRightProject);
    }

    private initProjectStruct(projStruct: AlignedProjectStruct, project: Project) {
        let projCtx: ProjectContext = new ProjectContext();
        projCtx.setProject(project);
        projStruct.context = projCtx;

        HttpServiceContext.setContextProject(project);
        this.mapleService.checkProjectMetadataAvailability().subscribe(
            available => {
                HttpServiceContext.removeContextProject();
                projStruct.profileAvailable = available;
            }
        );
    }

    private profileProject(projStruct: AlignedProjectStruct) {
        if (projStruct.profileAvailable) {
            this.basicModals.confirm("Profile project " + projStruct.context.getProject().getName(), "The project '" + projStruct.context.getProject().getName() + 
                "' has already been profiled. Do you want to repeat and override the profilation?", "warning").then(
                confirm => {
                    this.profileProjectImpl(projStruct);
                },
                cancel => {}
            )
        } else {
            this.profileProjectImpl(projStruct);
        }
        
    }
    private profileProjectImpl(projStruct: AlignedProjectStruct) {
        HttpServiceContext.setContextProject(projStruct.context.getProject());
        this.mapleService.profileProject().subscribe(
            () => {
                HttpServiceContext.removeContextProject();
                projStruct.profileAvailable = true;
            }
        );
    }


    ok() {
        this.mapleService.profileMatchingProblemBetweenProjects(this.leftProjectStruct.context.getProject(), this.rightProjectStruct.context.getProject()).subscribe(
            matchingProblem => {
                this.genomaService.createTask(matchingProblem).subscribe(
                    taskId => {
                        this.dialog.close(taskId);
                    }
                );
            }
        );
    }
    
    cancel() {
        this.dialog.dismiss();
    }

}

class AlignedProjectStruct {
    context: ProjectContext;
    profileAvailable: boolean = false;
}