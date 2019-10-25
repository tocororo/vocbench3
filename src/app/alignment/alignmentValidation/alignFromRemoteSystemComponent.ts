import { Component, ElementRef, ViewChild } from '@angular/core';
import { Modal, OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { AlignmentOverview } from '../../models/Alignment';
import { Project } from "../../models/Project";
import { RemoteAlignmentTask } from '../../models/RemoteAlignment';
import { EdoalServices } from '../../services/edoalServices';
import { MapleServices } from '../../services/mapleServices';
import { ProjectServices } from '../../services/projectServices';
import { RemoteAlignmentServices } from '../../services/remoteAlignmentServices';
import { HttpServiceContext } from '../../utils/HttpManager';
import { UIUtils } from '../../utils/UIUtils';
import { ProjectContext } from '../../utils/VBContext';
import { BasicModalServices } from '../../widget/modal/basicModal/basicModalServices';
import { AlignFromSource } from './alignFromSource';
import { CreateRemoteAlignmentTaskModal, CreateRemoteAlignmentTaskModalData } from './alignmentValidationModals/createRemoteAlignmentTaskModal';

@Component({
    selector: 'alignment-remote',
    templateUrl: './alignFromRemoteSystemComponent.html',
    host: { class: "vbox" }
})
export class AlignFromRemoteSystemComponent extends AlignFromSource {

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private tasks: RemoteAlignmentTask[];
    private selectedTask: RemoteAlignmentTask;

    constructor(edoalService: EdoalServices, projectService: ProjectServices,
        private remoteAlignmentService: RemoteAlignmentServices, private mapleService: MapleServices, private basicModal: BasicModalServices, private modal: Modal) {
        super(edoalService, projectService);
    }


    init() {
        HttpServiceContext.setContextProject(this.leftProject);
        this.mapleService.checkProjectMetadataAvailability().subscribe(
            available => {
                HttpServiceContext.removeContextProject();
                if (available) {
                    this.listTask();
                } else {
                    this.basicModal.confirm("Unavailable metadata", "Unable to find metadata about the current project '" + 
                        this.leftProject.getName() +  "', do you want to generate them?").then(
                        confirm => {
                            UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                            this.mapleService.profileProject().subscribe(
                                () => {
                                    UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                                    this.listTask();
                                }
                            )
                        },
                        cancel => {}
                    );
                }
            }
        )
    }

    private listTask() {
        this.tasks = null;
        this.selectedTask = null;
        let allowReordering: boolean = !this.isEdoalProject(); //if project is edoal, allow only task with the exact left-right datasets
        this.remoteAlignmentService.listTasks(this.leftProject, allowReordering, this.rightProject).subscribe(
            tasks => {
                this.tasks = tasks;
            }
        );
    }

    private selectTask(task: RemoteAlignmentTask) {
        if (this.selectedTask == task) {
            this.selectedTask = null;
        } else {
            this.selectedTask = task
        }
    }

    private createTask() {
        //if it is an edoal project, also the right project is forced to the one set in the edoal
        let rightProject: Project = this.isEdoalProject() ? this.rightProject : null;
        var modalData = new CreateRemoteAlignmentTaskModalData(this.leftProject, rightProject);
        const builder = new BSModalContextBuilder<CreateRemoteAlignmentTaskModalData>(
            modalData, undefined, CreateRemoteAlignmentTaskModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(CreateRemoteAlignmentTaskModal, overlayConfig).result.then(
            newTaskId => {
                this.listTask();
            },
            () => {}
        );
    }

    private deleteTask() {
        this.remoteAlignmentService.deleteTask(this.selectedTask.id).subscribe(() => {});
    }

    private fetchAlignment(task: RemoteAlignmentTask) {
        this.rightProject = new Project(task.rightDataset.projectName);
        this.remoteAlignmentService.fetchAlignment(task.id).subscribe(
            (overview: AlignmentOverview) => {
                this.alignmentOverview = overview;
            }
        );
    }

}

class AlignedProjectStruct {
    context: ProjectContext;
    profileAvailable: boolean = false;
}