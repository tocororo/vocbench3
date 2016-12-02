import { Component } from "@angular/core";
import {Modal, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {OverlayConfig} from 'angular2-modal';

import {UserProjBindingModal, UserProjBindingModalData} from "./userProjBindingModal";

import { User } from "../utils/User";
import { Project } from "../utils/Project";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { AdministrationServices } from "../services/administrationServices";


@Component({
    selector: "projects-admin-component",
    templateUrl: "./projectsAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class ProjectsAdministrationComponent {

    private usersBound: User[];
    private projectList: Project[];

    private selectedProject: Project;
    private selectedUser: User;

    constructor(private projectService: ProjectServices, private userService: UserServices, private adminService: AdministrationServices, 
        private modal: Modal) { }

    ngOnInit() {
        this.projectService.listProjects().subscribe(
            projects => {
                this.projectList = projects;
            }
        );
    }

    private selectProject(project: Project) {
        if (this.selectedProject != project) {
            this.selectedProject = project;
            this.userService.listUsersBoundToProject(this.selectedProject.getName()).subscribe(
                users => {
                    this.usersBound = users;
                    this.selectedUser = null;
                }
            )
        }
    }

    private selectUser(user: User) {
        this.selectedUser = user;
        this.adminService.getProjectUserBinding(this.selectedProject.getName(), this.selectedUser.getEmail()).subscribe();
    }

    private addUserToProject() {
        var modalData = new UserProjBindingModalData("Add user to " + this.selectedProject.getName(), this.usersBound);
        const builder = new BSModalContextBuilder<UserProjBindingModalData>(
            modalData, undefined, UserProjBindingModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(UserProjBindingModal, overlayConfig).then(
            dialog => dialog.result.then(
                data => {
                    var user: User = data.user;
                    var roles = data.roles;
                    console.log("adding user " + user.getLastName() + " to " + this.selectedProject.getName() + " with roles " + JSON.stringify(roles));
                    this.adminService.addProjectUserBinding(this.selectedProject.getName(), user.getEmail(), roles).subscribe(
                        stResp => {
                            this.usersBound.push(user);
                        }
                    )
                },
                () => {}
            )
        );
    }

    private removeUserFromProject() {
        console.log("remove user " + this.selectedUser.getLastName() + " from " + this.selectedProject.getName());
        //TODO call service
    }

}