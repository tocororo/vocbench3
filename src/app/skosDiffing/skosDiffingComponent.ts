import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { VersionInfo } from "../models/History";
import { DiffingTask, TaskResultType } from "../models/SkosDiffing";
import { SkosDiffingServices } from "../services/skosDiffingServices";
import { VersionsServices } from "../services/versionsServices";
import { UIUtils } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from '../widget/modal/Modals';
import { CreateDiffingTaskModal } from "./modals/createDiffingTaskModal";

@Component({
    selector: "skos-diffing",
    templateUrl: "./skosDiffingComponent.html",
    host: { class: "pageComponent" }
})
export class SkosDiffingComponent {

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    serverDown: boolean = false;

    tasks: DiffingTask[];
    selectedTask: DiffingTask;

    resultFormats: TaskResultType[] = [TaskResultType.html, TaskResultType.pdf, TaskResultType.json];
    selectedResultFormat: TaskResultType = this.resultFormats[0];

    private versions: VersionInfo[];

    constructor(private diffingService: SkosDiffingServices, private versionsService: VersionsServices, 
        private basicModals: BasicModalServices, private modalService: NgbModal) {}

    ngOnInit() {
        this.listTasks();
    }

    listTasks() {
        this.diffingService.getAllTasksInfo(VBContext.getWorkingProject().getName()).subscribe(
            tasks => {
                this.serverDown = false;
                this.tasks = tasks;
                //if there is a task with a version, retrieve the version ID
                if (this.tasks.some(t => t.leftDataset.versionRepoId != null || t.rightDataset.versionRepoId != null)) {
                    this.initVersions().subscribe(
                        () => {
                            this.tasks.forEach(t => {
                                if (t.leftDataset.versionRepoId == "") {
                                    t.leftDataset.versionId = "CURRENT";
                                } else {
                                    let leftVers = this.versions.find(v => v.repositoryId == t.leftDataset.versionRepoId);
                                    t.leftDataset.versionId = (leftVers != null) ? leftVers.versionId : t.leftDataset.versionRepoId;
                                }

                                if (t.rightDataset.versionRepoId == "") {
                                    t.rightDataset.versionId = "CURRENT";
                                } else {
                                    let leftVers = this.versions.find(v => v.repositoryId == t.rightDataset.versionRepoId);
                                    t.rightDataset.versionId = (leftVers != null) ? leftVers.versionId : t.rightDataset.versionRepoId;
                                }
                            })
                        }
                    );
                }
            },
            (err: Error) => {
                this.serverDown = true;
                this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.SKOS_DIFFING_SERVER_NOT_RESPONDING"}, ModalType.warning);
            }
        );
    }

    private initVersions(): Observable<void> {
        if (this.versions != null) {
            return of(null);
        } else {
            return this.versionsService.getVersions().pipe(
                map(versions => {
                    this.versions = versions;
                })
            )
        }
    }

    selectTask(task: DiffingTask) {
        if (this.selectedTask == task) {
            this.selectedTask = null;
        } else {
            this.selectedTask = task
        }
    }

    createTask() {
        this.modalService.open(CreateDiffingTaskModal, new ModalOptions('lg')).result.then(
            () => {
                this.listTasks();
            },
            () => {}
        );
    }

    deleteTask() {
        this.diffingService.deleteTask(this.selectedTask.taskId).subscribe(() => {
            this.listTasks();
        });
    }

    downloadTaskResult() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.diffingService.getTaskResult(this.selectedTask.taskId, this.selectedResultFormat).subscribe(
            report => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                // let url = window.URL.createObjectURL(report);
                // window.open(url);
                let exportLink = window.URL.createObjectURL(report);
                this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_SKOS_DIFFING_RESULT" }, null, exportLink, "result." + this.selectedResultFormat);
            },
        );
    }

}

export interface TaskResultFormatStruct { 
    label: string; 
    value: string;
}