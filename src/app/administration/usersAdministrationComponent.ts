import { Component } from "@angular/core";
import { UserServices } from "../services/userServices";
import { User, UserStatusEnum } from "../models/User";
import { VBContext } from "../utils/VBContext";
import { ModalServices } from "../widget/modal/modalServices";

@Component({
    selector: "users-admin-component",
    templateUrl: "./usersAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class UsersAdministrationComponent {

    private users: User[];
    private selectedUser: User;

    private showEnabled: boolean = true;
    private showDisabled: boolean = true;
    private showNew: boolean = true;

    constructor(private userService: UserServices, private modalService: ModalServices) { }

    ngOnInit() {
        this.initUserList();
    }

    private initUserList() {
        this.selectedUser = null;
        this.userService.listUsers().subscribe(
            users => {
                this.users = users;
            }
        )
    }

    private selectUser(user: User) {
        this.selectedUser = user;
    }

    /**
     * Based on filters "enabled" "disabled" "new" tells whether the user should be visible.
     */
    private isUserVisible(user: User): boolean {
        return ((user.getStatus() == UserStatusEnum.ENABLED && this.showEnabled) ||
            (user.getStatus() == UserStatusEnum.DISABLED && this.showDisabled) ||
            (user.getStatus() == UserStatusEnum.REGISTERED && this.showNew));
    }

    private isEnableButtonDisabled() {
        //user cannot disable himself
        return VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail();
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
                + this.selectedUser.getFirstName() + " " + this.selectedUser.getLastName() + ". Are you sure?", "warning").then(
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

    private isDeleteButtonDisabled() {
        //user cannot delete himself
        return VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail();
    }

    private deleteUser() {
        this.modalService.confirm("Delete user", "You are deleting user "
            + this.selectedUser.getFirstName() + " " + this.selectedUser.getLastName() + ". Are you sure?", "warning").then(
            result => {
                this.userService.deleteUser(this.selectedUser.getEmail()).subscribe(
                    stResp => {
                        this.initUserList();
                    }
                );
            },
            () => {}
        );
    }

}