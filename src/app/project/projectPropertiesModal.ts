import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ProjectServices} from "../services/projectServices";
import {Project} from '../utils/Project';

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
    
    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}