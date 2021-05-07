import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project } from "src/app/models/Project";

@Component({
    selector: "project-selection-modal",
    templateUrl: "./projectSelectionModal.html",
})
export class ProjectSelectionModal {
    @Input() title: string;
    @Input() message: string;

    selectedProject: Project;

    constructor(public activeModal: NgbActiveModal) {}

    selectProject(project: Project) {
        this.selectedProject = project;
    }

    ok() {
        this.activeModal.close(this.selectedProject);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}