import { Component, ElementRef, ViewChild } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { Observable } from "rxjs";
import { VersionInfo } from "../models/History";
import { DiffingTask, TaskResultType } from "../models/SkosDiffing";
import { SkosDiffingServices } from "../services/skosDiffingServices";
import { VersionsServices } from "../services/versionsServices";
import { UIUtils } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { CreateDiffingTaskModal } from "./modals/createDiffingTaskModal";

@Component({
    selector: "skos-diffing",
    templateUrl: "./skosDiffingComponent.html",
    host: { class: "pageComponent" }
})
export class SkosDiffingComponent {

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private serverDown: boolean = false;

    private tasks: DiffingTask[];
    private selectedTask: DiffingTask;

    private resultFormats: TaskResultType[] = [TaskResultType.html, TaskResultType.pdf, TaskResultType.json];
    private selectedResultFormat: TaskResultType = this.resultFormats[0];

    private versions: VersionInfo[];

    constructor(private diffingService: SkosDiffingServices, private versionsService: VersionsServices, 
        private basicModals: BasicModalServices, private modal: Modal) {}

    ngOnInit() {
        this.listTasks();
    }

    private listTasks() {
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
                this.basicModals.alert("SKOS diffing server error", "The SKOS diffing server didn't respond, "
                    + "make sure it is up and running.", "warning");
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
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.diffingService.getTaskResult(this.selectedTask.taskId, this.selectedResultFormat).subscribe(
            report => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                // let url = window.URL.createObjectURL(report);
                // window.open(url);
                let exportLink = window.URL.createObjectURL(report);
                this.basicModals.downloadLink("Download SKOS diffing result", null, exportLink, "result." + this.selectedResultFormat);
            },
        );
    }

}

export interface TaskResultFormatStruct { 
    label: string; 
    value: string;
}