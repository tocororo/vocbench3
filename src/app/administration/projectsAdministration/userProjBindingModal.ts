import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project } from "../../models/Project";
import { Role, User } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { UserServices } from "../../services/userServices";

@Component({
    selector: "up-binding-modal",
    templateUrl: "./userProjBindingModal.html",
})
export class UserProjBindingModal {
    @Input() project: Project;
    @Input() usersBound: User[];

    userList: User[] = [];
    selectedUser: User;

    roleList: Role[] = [];
    selectedRoles: Role[] = [];
    
    constructor(public activeModal: NgbActiveModal, public userService: UserServices,
        public adminService: AdministrationServices) {
    }

    ngOnInit() {
        this.userService.listUsers().subscribe(
            users => {
                this.userList = users;
            }
        );
        this.adminService.listRoles(this.project).subscribe(
            roles => {
                this.roleList = roles;
            }
        );
    }

    private selectUser(user: User) {
        if (this.isUserAlreadyBound(user)) {
            return;
        }
        if (this.selectedUser == user) {
            this.selectedUser = null;
        } else {
            this.selectedUser = user;
        }
    }

    private isUserAlreadyBound(user: User): boolean {
        for (let i = 0; i < this.usersBound.length; i++) {
            if (user.getEmail() == this.usersBound[i].getEmail()) {
                return true;
            }
        }
        return false;
    }

    private selectRole(role: Role) {
        let idx = this.selectedRoles.indexOf(role);
        if (idx != -1) {
            this.selectedRoles.splice(idx, 1);
        } else {
            this.selectedRoles.push(role);
        }
    }

    private isRoleSelected(role: Role): boolean {
        return this.selectedRoles.indexOf(role) != -1;
    }
    
    ok() {
        let roleList: string[] = [];
        for (let i = 0; i < this.selectedRoles.length; i++) {
            roleList.push(this.selectedRoles[i].getName());
        }
        this.activeModal.close({user: this.selectedUser, roles: roleList});
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}