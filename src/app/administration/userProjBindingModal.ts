import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import { UserServices } from "../services/userServices";
import { User } from "../utils/User";

export class UserProjBindingModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public usersBound: Array<User>) {
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

    private roleList: any[] = [
        "ROLE_ADMIN", "ROLE_USER"
    ]; //TODO this will be retrieved from server and I should foreseen a class Role {name: string, capabilities: string[]}
    private selectedRoles: string[] = [];
    
    constructor(public dialog: DialogRef<UserProjBindingModalData>, public userService: UserServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.userService.listUsers().subscribe(
            users => {
                this.userList = users;
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

    private selectRole(role: string) {
        var idx = this.selectedRoles.indexOf(role);
        if (idx != -1) {
            this.selectedRoles.splice(idx, 1);
        } else {
            this.selectedRoles.push(role);
        }
    }

    private isRoleSelected(role: string): boolean {
        return this.selectedRoles.includes(role);
    }
    
    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close({user: this.selectedUser, roles: this.selectedRoles});
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}