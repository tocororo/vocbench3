import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import {ProjectServices} from "../services/projectServices";
import {Project} from '../models/Project';

export class ProjectPropertiesModalData extends BSModalContext {
    constructor(public project: Project) {
        super();
    }
}

@Component({
    selector: "project-properties-modal",
    templateUrl: "./projectPropertiesModal.html",
})
export class ProjectPropertiesModal implements ModalComponent<ProjectPropertiesModalData> {
    context: ProjectPropertiesModalData;

    private propertyList: Array<any> = [];
    
    constructor(public dialog: DialogRef<ProjectPropertiesModalData>, private projectService: ProjectServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.projectService.getProjectPropertyMap(this.context.project).subscribe(
            propList => {
                this.propertyList = propList;
            }
        )
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}