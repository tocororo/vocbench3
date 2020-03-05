import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Project } from '../../models/Project';
import { ProjectServices } from "../../services/projectServices";

export class ProjectDirModalData extends BSModalContext {
    constructor(public project: Project, public currentDir: string, public availableDirs: string[]) {
        super();
    }
}

@Component({
    selector: "project-dir-modal",
    templateUrl: "./projectDirModal.html",
})
export class ProjectDirModal implements ModalComponent<ProjectDirModalData> {
    context: ProjectDirModalData;

    private directories: string[]
    private dirName: string;

    constructor(public dialog: DialogRef<ProjectDirModalData>, private projectService: ProjectServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.directories = this.context.availableDirs;
        this.directories.sort();
        this.dirName = this.context.currentDir;
    }

    ok() {
        let dirNameValue: string = (this.dirName != null && this.dirName.trim() != "") ? this.dirName : null;
        if (this.context.currentDir != dirNameValue) { //directory changed
            this.projectService.setProjectFacetDir(this.context.project.getName(), dirNameValue).subscribe(
                () => {
                    this.dialog.close();
                }
            );
        } else { //directory not changed => dismiss dialog, so the calling component will know that the dir is not changed
            this.cancel()
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}
