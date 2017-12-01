import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import { UserServices } from "../../services/userServices";
import { AdministrationServices } from "../../services/administrationServices";
import { User, Role } from "../../models/User";
import { Project } from "../../models/Project";

export class UserProjBindingModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public project: Project, public usersBound: Array<User>) {
        super();
    }
}

@Component({
    selector: "up-binding-modal",
    templateUrl: "./userProjBindingModal.html",
})
export class UserProjBindingModal implements ModalComponent<UserProjBindingModalData> {
    context: UserProjBindingModalData;

    private userList: User[] = [];
    private selectedUser: User;

    private roleList: Role[] = [];
    private selectedRoles: Role[] = [];
    
    constructor(public dialog: DialogRef<UserProjBindingModalData>, public userService: UserServices,
        public adminService: AdministrationServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.userService.listUsers().subscribe(
            users => {
                this.userList = users;
            }
        )
        this.adminService.listRoles(this.context.project).subscribe(
            roles => {
                this.roleList = roles;
            }
        )
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
        for (var i = 0; i < this.context.usersBound.length; i++) {
            if (user.getEmail() == this.context.usersBound[i].getEmail()) {
                return true;
            }
        }
        return false;
    }

    private selectRole(role: Role) {
        var idx = this.selectedRoles.indexOf(role);
        if (idx != -1) {
            this.selectedRoles.splice(idx, 1);
        } else {
            this.selectedRoles.push(role);
        }
    }

    private isRoleSelected(role: Role): boolean {
        return this.selectedRoles.indexOf(role) != -1;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        var roleList: string[] = [];
        for (var i = 0; i < this.selectedRoles.length; i++) {
            roleList.push(this.selectedRoles[i].getName());
        }
        this.dialog.close({user: this.selectedUser, roles: roleList});
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}