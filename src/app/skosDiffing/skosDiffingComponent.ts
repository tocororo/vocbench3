import { Component } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { Observable } from "rxjs";
import { VersionInfo } from "../models/History";
import { DiffingTask, TaskResultType } from "../models/SkosDiffing";
import { SkosDiffingServices } from "../services/skosDiffingServices";
import { VersionsServices } from "../services/versionsServices";
import { VBContext } from "../utils/VBContext";
import { CreateDiffingTaskModal } from "./modals/createDiffingTaskModal";

@Component({
    selector: "skos-diffing",
    templateUrl: "./skosDiffingComponent.html",
    host: { class: "pageComponent" }
})
export class SkosDiffingComponent {

    private tasks: DiffingTask[];
    private selectedTask: DiffingTask;

    private resultFormats: TaskResultType[] = [TaskResultType.html, TaskResultType.pdf, TaskResultType.json];
    private selectedResultFormat: TaskResultType = this.resultFormats[0];

    private versions: VersionInfo[];

    constructor(private diffingService: SkosDiffingServices, private versionsService: VersionsServices, private modal: Modal) {}

    ngOnInit() {
        this.listTasks();
    }

    private listTasks() {
        this.diffingService.getAllTasksInfo(VBContext.getWorkingProject().getName()).subscribe(
            tasks => {
                this.tasks = tasks;
                //if there is a task with a version, retrieve the version ID
                if (this.tasks.some(t => t.versionRepoId1 != null || t.versionRepoId2 != null)) {
                    this.initVersions().subscribe(
                        () => {
                            this.tasks.forEach(t => {
                                let v1 = this.versions.find(v => v.repositoryId == t.versionRepoId1);
                                t.versionId1 = (v1 != null) ? v1.versionId : v1.repositoryId;
                                let v2 = this.versions.find(v => v.repositoryId == t.versionRepoId1);
                                t.versionId2 = (v2 != null) ? v2.versionId : v2.repositoryId;
                            })
                        }
                    );
                }
            }
        );
    }

    private initVersions(): Observable<void> {
        if (this.versions != null) {
            return Observable.of(null);
        } else {
            return this.versionsService.getVersions().map(
                versions => {
                    this.versions = versions;
                }
            )
        }
    }

    private selectTask(task: DiffingTask) {
        if (this.selectedTask == task) {
            this.selectedTask = null;
        } else {
            this.selectedTask = task
        }
    }

    createTask() {
        const builder = new BSModalContextBuilder<BSModalContext>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(CreateDiffingTaskModal, overlayConfig).result.then(
            () => {
                this.listTasks();
            },
            () => {}
        );
    }

    private deleteTask() {
        this.diffingService.deleteTask(this.selectedTask.taskId).subscribe(() => {
            this.listTasks();
        });
    }

    private downloadTaskResult() {
        this.diffingService.getTaskResult(this.selectedTask.taskId, this.selectedResultFormat).subscribe(
            report => {
                let url = window.URL.createObjectURL(report);
                window.open(url);
            },
        );
    }

}

export interface TaskResultFormatStruct { 
    label: string; 
    value: string;
}