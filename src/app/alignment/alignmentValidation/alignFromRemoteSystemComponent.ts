import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { from, Observable, of } from 'rxjs';
import { catchError, finalize, map, mergeMap } from 'rxjs/operators';
import { ServiceMetadataDTO } from 'src/app/models/Maple';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
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
import { BasicModalServices } from '../../widget/modal/basicModal/basicModalServices';
import { AlignFromSource } from './alignFromSource';
import { CreateRemoteAlignmentTaskModal } from './alignmentValidationModals/createRemoteAlignmentTaskModal';
import { RemoteSystemSettingsModal } from './alignmentValidationModals/remoteSystemSettingsModal';

@Component({
    selector: 'alignment-remote',
    templateUrl: './alignFromRemoteSystemComponent.html',
    host: { class: "vbox" }
})
export class AlignFromRemoteSystemComponent extends AlignFromSource {

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    serviceReady: boolean;
    serverDown: boolean;
    serviceNotConfigured: boolean;

    serviceMetadata: ServiceMetadataDTO = null;

    isSettingsAuthorized: boolean;

    private tasks: RemoteAlignmentTask[];
    selectedTask: RemoteAlignmentTask;

    constructor(edoalService: EdoalServices, projectService: ProjectServices,
        private remoteAlignmentService: RemoteAlignmentServices, private mapleService: MapleServices,
        private basicModals: BasicModalServices, private modalService: NgbModal) {
        super(edoalService, projectService);
    }

    /**
     * Initializes the tasks list checking first that the two projects has been profiled
     */
    init() {
        this.isSettingsAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.remoteAlignmentServiceRead);

        this.ensureDatasetProfiled(this.leftProject).subscribe(
            profiledLeft => {
                if (profiledLeft) {
                    this.ensureDatasetProfiled(this.rightProject).subscribe(
                        profiledRight => {
                            if (profiledRight) {
                                this.listTask();
                            }
                        }
                    );
                }
            }
        );
    }

    /**
     * Ensures that the remote alignment service is initialized. 
     * Return a boolean observable which is:
     * - true, if service is up and running (it responds)
     * - false, otherwise.
     */
    private ensureServiceInitialized(): Observable<boolean> {
        if (this.serviceMetadata != null) {
            return of(true);
        } else {
            UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
            return this.remoteAlignmentService.getServiceMetadata().pipe(
                finalize(() => { UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement); }),
                map(serviceMetadata => {
                    this.serviceReady = true;
                    this.serverDown = false;
                    this.serviceNotConfigured = false;
                    this.serviceMetadata = serviceMetadata;
                    return true;
                }),
                catchError(err => {
                    return this.errorHandler(err);
                })
            );
        }
        
    }

    private errorHandler(err: Error): Observable<boolean> {
        //handle the only exception let through by the default handler
        if (err.name == "it.uniroma2.art.semanticturkey.services.core.alignmentservices.AlignmentServiceException") {
            if (err.message.includes("HttpHostConnectException")) {
                this.serverDown = true;
                this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.ALIGNMENT_SERVICE_NOT_RESPONDING" }, ModalType.warning);
            } else {
                this.basicModals.alert({ key: "STATUS.ERROR" }, err.message, ModalType.warning, err.stack);
            }
        } else if (err.name == "java.lang.IllegalStateException") {
            if (err.message.includes("No alignement service configured")) {
                this.serviceNotConfigured = true;
            } else {
                this.basicModals.alert({ key: "STATUS.ERROR" }, err.message, ModalType.error, err.stack);
            }
        }
        return of(false);
    }

    /**
     * Ensure the profilation of the given project.
     * Returns true if the project is already profiled or if the user profile it at the moment.
     * Returns false if the project profilation is denied by the user.
     * @param project 
     */
    private ensureDatasetProfiled(project: Project): Observable<boolean> {
        if (project != null) {
            return this.checkDatasetProfiled(project).pipe(
                mergeMap(profiled => {
                    if (profiled) {
                        return of(true);
                    } else {
                        return this.profileProject(project);
                    }
                })
            );
        } else { //in case of non-Edoal project, the right dataset is not given a-priori, so it could be null
            return of(true);
        }

    }

    /**
     * Check that the given project has been profiled.
     * @param project 
     */
    private checkDatasetProfiled(project: Project): Observable<boolean> {
        HttpServiceContext.setContextProject(project);
        return this.mapleService.checkProjectMetadataAvailability().pipe(
            finalize(() => HttpServiceContext.removeContextProject()),
            map(available => {
                return available;
            })
        );
    }

    /**
     * Profiles the project (under the user the permission).
     * Returns true if the project has been profiled, false if the user denied the operation.
     * 
     * @param project 
     */
    private profileProject(project: Project): Observable<boolean> {
        return from(
            this.basicModals.confirm({ key: "ALIGNMENT.VALIDATION.REMOTE_SYS.CREATE_TASK.METADATA_PROFILE_NOT_AVAILABLE" },
                { key: "MESSAGES.ALIGNED_PROJ_METADATA_NOT_FOUND_GENERATE_CONFIRM", params: { project: project.getName() } }).then(
                    confirm => {
                        HttpServiceContext.setContextProject(project);
                        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                        return this.mapleService.profileProject().pipe(
                            finalize(() => HttpServiceContext.removeContextProject()),
                            map(() => {
                                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                                return true;
                            })
                        );
                    },
                    cancel => {
                        return of(false);
                    }
                )
        ).pipe(
            mergeMap(profiled => profiled)
        );
    }

    listTask() {
        //reset all before retrieving tasks
        this.tasks = null;
        this.selectedTask = null;
        let allowReordering: boolean = !this.isEdoalProject(); //if project is edoal, allow only task with the exact left-right datasets

        this.ensureServiceInitialized().subscribe(
            (ok: boolean) => {
                if (ok) {
                    this.remoteAlignmentService.listTasks(this.leftProject, allowReordering, this.rightProject).subscribe(
                        tasks => {
                            this.tasks = tasks;
                        },
                        err => this.errorHandler(err)
                    );
                }
            }
        );
    }

    selectTask(task: RemoteAlignmentTask) {
        if (this.selectedTask == task) {
            this.selectedTask = null;
        } else {
            this.selectedTask = task;
        }
    }

    createTask() {
        //if it is an edoal project, also the right project is forced to the one set in the edoal
        let rightProject: Project = this.isEdoalProject() ? this.rightProject : null;
        const modalRef: NgbModalRef = this.modalService.open(CreateRemoteAlignmentTaskModal, new ModalOptions('lg'));
        modalRef.componentInstance.leftProject = this.leftProject;
        modalRef.componentInstance.rightProject = rightProject;
        modalRef.result.then(
            () => {
                this.listTask();
            },
            () => { }
        );
    }

    deleteTask() {
        this.remoteAlignmentService.deleteTask(this.selectedTask.id).subscribe(() => {
            this.listTask();
            this.alignmentOverview = null;
        });
    }

    fetchAlignment(task: RemoteAlignmentTask) {
        this.rightProject = new Project(task.rightDataset.projectName);
        this.remoteAlignmentService.fetchAlignment(task.id).subscribe(
            (overview: AlignmentOverview) => {
                this.alignmentOverview = overview;
            }
        );
    }

    settings() {
        this.modalService.open(RemoteSystemSettingsModal, new ModalOptions()).result.then(
            (configChanged: boolean) => {
                if (configChanged) {
                    this.serviceMetadata = null;
                    this.listTask();
                }
            }
        );
    }

}