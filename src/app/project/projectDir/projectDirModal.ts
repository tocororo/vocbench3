import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project } from '../../models/Project';
import { ProjectServices } from "../../services/projectServices";

@Component({
    selector: "project-dir-modal",
    templateUrl: "./projectDirModal.html",
})
export class ProjectDirModal {
    @Input() project: Project;
    @Input() currentDir: string;
    @Input() availableDirs: string[];

    directories: string[]
    dirName: string;

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices) {}

    ngOnInit() {
        this.directories = this.availableDirs;
        this.directories.sort((d1: string, d2: string) => d1.toLocaleLowerCase().localeCompare(d2.toLocaleLowerCase()));
        this.dirName = this.currentDir;
    }

    ok() {
        let dirNameValue: string = (this.dirName != null && this.dirName.trim() != "") ? this.dirName : null;
        if (this.currentDir != dirNameValue) { //directory changed
            this.projectService.setProjectFacetDir(this.project.getName(), dirNameValue).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        } else { //directory not changed => dismiss dialog, so the calling component will know that the dir is not changed
            this.cancel()
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}
