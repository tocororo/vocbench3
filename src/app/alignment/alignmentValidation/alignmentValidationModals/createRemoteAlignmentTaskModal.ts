import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Project } from "../../../models/Project";
import { MapleServices } from "../../../services/mapleServices";
import { ProjectServices } from "../../../services/projectServices";
import { RemoteAlignmentServices } from "../../../services/remoteAlignmentServices";
import { HttpServiceContext } from "../../../utils/HttpManager";
import { UIUtils } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

export class CreateRemoteAlignmentTaskModalData extends BSModalContext {
    constructor(public leftProject: Project, public rightProject: Project) {
        super();
    }
}

@Component({
    selector: "create-alignment-task-modal",
    templateUrl: "./createRemoteAlignmentTaskModal.html",
    host: { class: "blockingDivHost" }
})
export class CreateRemoteAlignmentTaskModal implements ModalComponent<CreateRemoteAlignmentTaskModalData> {
    context: CreateRemoteAlignmentTaskModalData;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private projectList: Project[];
    private selectedRightProject: Project;

    private leftProjectStruct: AlignedProjectStruct;
    private rightProjectStruct: AlignedProjectStruct;

    constructor(public dialog: DialogRef<CreateRemoteAlignmentTaskModalData>, private projectService: ProjectServices,
        private mapleService: MapleServices, private remoteAlignmentService: RemoteAlignmentServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //TODO in production, 2nd parameter should be true? the target dataset should be user dependent?
        this.projectService.listProjects(VBContext.getWorkingProject(), false, true).subscribe(
            projects => {
                this.projectList = projects;
                if (this.context.rightProject != null) {
                    this.selectedRightProject = this.projectList.find(p => p.getName() == this.context.rightProject.getName());
                    if (this.selectedRightProject != null) {
                        this.onRightProjectChange();
                    }
                }
            }
        );
        this.leftProjectStruct = new AlignedProjectStruct();
        this.leftProjectStruct.project = this.context.leftProject;
        this.initProjectStruct(this.leftProjectStruct);
    }

    private onRightProjectChange() {
        this.rightProjectStruct = new AlignedProjectStruct();
        this.rightProjectStruct.project = this.selectedRightProject;
        this.initProjectStruct(this.rightProjectStruct);
    }

    private initProjectStruct(projStruct: AlignedProjectStruct) {
        HttpServiceContext.setContextProject(projStruct.project);
        this.mapleService.checkProjectMetadataAvailability().finally(
            () => HttpServiceContext.removeContextProject()
        ).subscribe(
            available => {
                projStruct.profileAvailable = available;
            }
        );
    }

    private profileProject(projStruct: AlignedProjectStruct) {
        if (projStruct.profileAvailable) {
            this.basicModals.confirm("Profile project " + projStruct.project.getName(), "The project '" + projStruct.project.getName() + 
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
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        HttpServiceContext.setContextProject(projStruct.project);
        this.mapleService.profileProject().finally(
            () => HttpServiceContext.removeContextProject()
        ).subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                projStruct.profileAvailable = true;
            }
        );
    }

    private isOkEnabled() {
        return (
            this.leftProjectStruct.profileAvailable &&
            this.rightProjectStruct != null && this.rightProjectStruct.profileAvailable
        )
    }

    ok() {
        this.mapleService.profileMatchingProblemBetweenProjects(this.leftProjectStruct.project, this.rightProjectStruct.project).subscribe(
            matchingProblem => {
                this.remoteAlignmentService.createTask(matchingProblem).subscribe(
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
    project: Project;
    profileAvailable: boolean = false;
}