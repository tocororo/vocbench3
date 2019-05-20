import { Component } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { User, UserStatusEnum } from "../../models/User";
import { UserServices } from "../../services/userServices";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ForcePasswordModal, ForcePasswordModalData } from "./forcePasswordModal";
import { UserCreateModal, UserCreateModalData } from "./userCreateModal";

@Component({
    selector: "users-admin-component",
    templateUrl: "./usersAdministrationComponent.html",
    host: { class: "pageComponent" },
    styles: ['.green { color: green; font-weight: bold; } .red { color: red; font-weight: bold; }']
})
export class UsersAdministrationComponent {

    private users: User[];
    private selectedUser: User;

    private showActive: boolean = true;
    private showInactive: boolean = true;
    private showNew: boolean = true;

    constructor(private userService: UserServices, private basicModals: BasicModalServices, private modal: Modal) { }

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

    private createUser() {
        var modalData = new UserCreateModalData("Create user");
        const builder = new BSModalContextBuilder<UserCreateModalData>(
            modalData, undefined, UserCreateModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(UserCreateModal, overlayConfig).result.then(
            res => {
                this.initUserList();
            },
            () => {}
        );
    }

    /**
     * Based on filters "enabled" "disabled" "new" tells whether the user should be visible.
     */
    private isUserVisible(user: User): boolean {
        return ((user.getStatus() == UserStatusEnum.ACTIVE && this.showActive) ||
            (user.getStatus() == UserStatusEnum.INACTIVE && this.showInactive) ||
            (user.getStatus() == UserStatusEnum.NEW && this.showNew));
    }

    /**
     * Tells if a user is active
     */
    private isUserActive(user: User): boolean {
        if (user != null) { //user passed could be selectedUser that could be null
            return user.getStatus() == UserStatusEnum.ACTIVE;
        }
        return false;
    }

    private isChangeStatusButtonDisabled() {
        //user cannot change status of himself
        return VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail();
    }

    private enableDisableUser() {
        var enabled = this.selectedUser.getStatus() == UserStatusEnum.ACTIVE;
        if (enabled) {
            this.userService.enableUser(this.selectedUser.getEmail(), false).subscribe(
                user => {
                    this.selectedUser.setStatus(UserStatusEnum.INACTIVE);
                }
            );
        } else {
            this.userService.enableUser(this.selectedUser.getEmail(), true).subscribe(
                user => {
                    this.selectedUser.setStatus(UserStatusEnum.ACTIVE);
                }
            )
        }
    }

    private isDeleteButtonDisabled() {
        //user cannot delete himself
        return VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail();
    }

    private deleteUser() {
        this.basicModals.confirm("Delete user", "You are deleting user "
            + this.selectedUser.getShow() + ". Are you sure?", "warning").then(
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

    private isChangePwdButtonDisabled() {
        //admin cannot change its password
        return VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail();
    }

    private changePassword() {
        var modalData = new ForcePasswordModalData(this.selectedUser);
        const builder = new BSModalContextBuilder<ForcePasswordModalData>(
            modalData, undefined, ForcePasswordModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ForcePasswordModal, overlayConfig).result.then();
    }

}