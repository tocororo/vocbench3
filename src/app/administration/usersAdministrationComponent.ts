import { Component } from "@angular/core";

import { UserServices } from "../services/userServices";
import { User, UserStatusEnum } from "../utils/User";
import { ModalServices } from "../widget/modal/modalServices";

@Component({
    selector: "users-admin-component",
    templateUrl: "./usersAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class UsersAdministrationComponent {

    private users: User[];
    private selectedUser: User;

    constructor(private userService: UserServices, private modalService: ModalServices) { }

    ngOnInit() {
        this.userService.listUsers().subscribe(
            users => {
                this.users = users;
            }
        )
    }

    private selectUser(user: User) {
        this.selectedUser = user;
    }

    private enableDisableUser() {
        var enabled = this.selectedUser.getStatus() == UserStatusEnum.ENABLED;
        if (enabled) {
            this.modalService.confirm("Disable user", "You are disabling user "
                + this.selectedUser.getFirstName() + " " + this.selectedUser.getLastName() + ". Are you sure?").then(
                result => {
                    this.userService.enableUser(this.selectedUser.getEmail(), false).subscribe(
                        user => {
                            this.selectedUser.setStatus(UserStatusEnum.DISABLED);
                        }
                    )
                },
                () => {}
            );
        } else {
            this.modalService.confirm("Enable user", "You are enabling user "
                + this.selectedUser.getFirstName() + " " + this.selectedUser.getLastName() + ". Are you sure?").then(
                result => {
                    this.userService.enableUser(this.selectedUser.getEmail(), true).subscribe(
                        user => {
                            this.selectedUser.setStatus(UserStatusEnum.ENABLED);
                        }
                    )
                },
                () => {}
            );
        }
    }

}