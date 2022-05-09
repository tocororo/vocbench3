import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project } from '../models/Project';
import { ProjectServices } from "../services/projectServices";

@Component({
    selector: "project-properties-modal",
    templateUrl: "./projectPropertiesModal.html",
})
export class ProjectPropertiesModal {
    @Input() project: Project;

    propertyList: { name: string, value: string }[] = [];
    
    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices) {}

    ngOnInit() {
        this.projectService.getProjectPropertyMap(this.project).subscribe(
            propList => {
                propList.sort((p1: { name: string, value: string }, p2: { name: string, value: string }) => {
                    return p1.name.localeCompare(p2.name);
                });
                this.propertyList = propList;
            }
        );
    }
    
    ok() {
        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}