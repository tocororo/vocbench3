import { Component, ElementRef, ViewChild } from '@angular/core';
import { Modal, OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from 'rxjs';
import { AlignmentOverview } from '../../models/Alignment';
import { Project } from "../../models/Project";
import { RemoteAlignmentTask } from '../../models/RemoteAlignment';
import { EdoalServices } from '../../services/edoalServices';
import { MapleServices } from '../../services/mapleServices';
import { ProjectServices } from '../../services/projectServices';
import { RemoteAlignmentServices } from '../../services/remoteAlignmentServices';
import { AuthorizationEvaluator } from '../../utils/AuthorizationEvaluator';
import { HttpServiceContext } from '../../utils/HttpManager';
import { UIUtils } from '../../utils/UIUtils';
import { VBActionsEnum } from '../../utils/VBActions';
import { ProjectContext } from '../../utils/VBContext';
import { BasicModalServices } from '../../widget/modal/basicModal/basicModalServices';
import { AlignFromSource } from './alignFromSource';
import { CreateRemoteAlignmentTaskModal, CreateRemoteAlignmentTaskModalData } from './alignmentValidationModals/createRemoteAlignmentTaskModal';
import { RemoteSystemSettingsModal } from './alignmentValidationModals/remoteSystemSettingsModal';

@Component({
    selector: 'alignment-remote',
    templateUrl: './alignFromRemoteSystemComponent.html',
    host: { class: "vbox" }
})
export class AlignFromRemoteSystemComponent extends AlignFromSource {

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private serverDown: boolean = false;

    private tasks: RemoteAlignmentTask[];
    private selectedTask: RemoteAlignmentTask;

    private isSettingsAuthorized: boolean;

    constructor(edoalService: EdoalServices, projectService: ProjectServices,
        private remoteAlignmentService: RemoteAlignmentServices, private mapleService: MapleServices, 
        private basicModals: BasicModalServices, private modal: Modal) {
        super(edoalService, projectService);
    }

    /**
     * Initializes the tasks list checking first that the two projects has been profiled
     */
    init() {
        this.isSettingsAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.remoteAlignmentServiceRead);

        this.ensureDatasetProfiled(this.leftProject, "left").subscribe(
            profiledLeft => {
                if (profiledLeft) {
                    this.ensureDatasetProfiled(this.rightProject, "right").subscribe(
                        profiledRight => {
                            if (profiledRight) {
                                this.listTask();
                            }
                        }
                    )
                }
            }
        )
    }

    /**
     * Ensure the profilation of the given project.
     * Returns true if the project is already profiled or if the user profile it at the moment.
     * Returns false if the project profilation is denied by the user.
     * @param project 
     */
    private ensureDatasetProfiled(project: Project, datasetPosition: DatasetPosition): Observable<boolean> {
        if (project != null) {
            return this.checkDatasetProfiled(project).flatMap(
                profiled => {
                    if (profiled) {
                        return Observable.of(true);
                    } else {
                        return this.profileProject(project, datasetPosition);
                    }
                }
            )
        } else { //in case of non-Edoal project, the right dataset is not given a-priori, so it could be null
            return Observable.of(true);
        }
        
    }

    /**
     * Check that the given project has been profiled.
     * @param project 
     */
    private checkDatasetProfiled(project: Project): Observable<boolean> {
        HttpServiceContext.setContextProject(project);
        return this.mapleService.checkProjectMetadataAvailability().map(
            available => {
                return available;
            }
        ).finally(
            () => HttpServiceContext.removeContextProject()
        );
    }

    /**
     * Profiles the project (under the user the permission).
     * Returns true if the project has been profiled, false if the user denied the operation.
     * 
     * @param project 
     */
    private profileProject(project: Project, datasetPosition: DatasetPosition): Observable<boolean> {
        return Observable.fromPromise(
            this.basicModals.confirm("Unavailable metadata", "Unable to find metadata about the " + datasetPosition + 
                " project '" + project.getName() +  "', do you want to generate them? (Required for the alignment)").then(
                confirm => {
                    HttpServiceContext.setContextProject(project);
                    UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                    return this.mapleService.profileProject().map(
                        () => {
                            UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                            return true;
                        }
                    ).finally(
                        () => HttpServiceContext.removeContextProject()
                    );
                },
                cancel => {
                    return Observable.of(false)
                }
            )
        ).flatMap(
            profiled => profiled
        );
    }

    private listTask() {
        this.tasks = null;
        this.selectedTask = null;
        let allowReordering: boolean = !this.isEdoalProject(); //if project is edoal, allow only task with the exact left-right datasets
        this.remoteAlignmentService.listTasks(this.leftProject, allowReordering, this.rightProject).subscribe(
            tasks => {
                this.serverDown = false;
                this.tasks = tasks;
            },
            (err: Error) => {
                //handle the only exception let through by the default handler
                if (err.name == "it.uniroma2.art.semanticturkey.services.core.alignmentservices.AlignmentServiceException") {
                    if (err.message.includes("HttpHostConnectException")) {
                        this.serverDown = true;
                        this.basicModals.alert("Alignment Service server error", "The Alignment Service server didn't respond, "
                            + "make sure it is up and running or the configuration is correct", "warning");
                    } else {
                        this.basicModals.alert("Alignment Service server error", err.message, "warning", err.stack);
                    }
                }
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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(CreateRemoteAlignmentTaskModal, overlayConfig).result.then(
            newTaskId => {
                this.listTask();
            },
            () => {}
        );
    }

    private deleteTask() {
        this.remoteAlignmentService.deleteTask(this.selectedTask.id).subscribe(() => {
            this.listTask();
            this.alignmentOverview = null;
        });
    }

    private fetchAlignment(task: RemoteAlignmentTask) {
        this.rightProject = new Project(task.rightDataset.projectName);
        this.remoteAlignmentService.fetchAlignment(task.id).subscribe(
            (overview: AlignmentOverview) => {
                this.alignmentOverview = overview;
            }
        );
    }

    private settings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(RemoteSystemSettingsModal, overlayConfig);
    }

}

class AlignedProjectStruct {
    context: ProjectContext;
    profileAvailable: boolean = false;
}

type DatasetPosition = "left" | "right";