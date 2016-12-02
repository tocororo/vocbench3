import { Component } from "@angular/core";
import {Modal, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {OverlayConfig} from 'angular2-modal';

import {UserProjBindingModal, UserProjBindingModalData} from "./userProjBindingModal";

import { User } from "../utils/User";
import { Project } from "../utils/Project";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";


@Component({
    selector: "projects-admin-component",
    templateUrl: "./projectsAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class ProjectsAdministrationComponent {

    private users: User[];
    private projects: Project[];

    private selectedProject: Project;
    private selectedUser: User;

    constructor(private projectService: ProjectServices, private userService: UserServices, private modal: Modal) { }

    ngOnInit() {
        this.projectService.listProjects().subscribe(
            projects => {
                this.projects = projects;
            }
        );
    }

    private selectProject(project: Project) {
        this.selectedProject = project;
        this.userService.listUsersBoundToProject(this.selectedProject.getName()).subscribe(
            users => {
                this.users = users;
                this.selectedUser = null;
            }
        )
    }

    private selectUser(user: User) {
        this.selectedUser = user;
    }

    private addUserToProject() {
        var modalData = new UserProjBindingModalData("Add user to " + this.selectedProject.getName(), this.users);
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