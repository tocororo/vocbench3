import { Component } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { DiffingTask, TaskResultType } from "../models/SkosDiffing";
import { SkosDiffingServices } from "../services/skosDiffingServices";
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

    constructor(private diffingService: SkosDiffingServices, private modal: Modal) {}

    ngOnInit() {
        this.listTasks();
    }

    private listTasks() {
        this.diffingService.getAllTasksInfo().subscribe(
            tasks => {
                this.tasks = tasks;
            }
        );
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
        this.diffingService.getTaskResult(this.selectedTask.taskId, this.selectedResultFormat).subscribe();
    }

}

export interface TaskResultFormatStruct { 
    label: string; 
    value: string;
}