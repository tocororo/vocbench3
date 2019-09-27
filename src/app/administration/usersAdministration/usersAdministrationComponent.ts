import { Component } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { User, UserFormFields, UserStatusEnum } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { UserServices } from "../../services/userServices";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ForcePasswordModal, ForcePasswordModalData } from "./forcePasswordModal";
import { UserCreateModal, UserCreateModalData } from "./userCreateModal";

@Component({
    selector: "users-admin-component",
    templateUrl: "./usersAdministrationComponent.html",
    host: { class: "pageComponent" },
    styles: [`
        .online { color: green; font-weight: bold; } 
        .inactive { color: red; font-weight: bold; }
        .offline { color: lightgray }
    `]
})
export class UsersAdministrationComponent {

    private users: User[];
    private selectedUser: User;
    private formFields: UserFormFields;
    private customFieldsRowsIdx: number[];

    private showActive: boolean = true;
    private showInactive: boolean = true;
    private showNew: boolean = true;

    constructor(private userService: UserServices, private administrationServices: AdministrationServices,
        private basicModals: BasicModalServices, private modal: Modal) { }

    ngOnInit() {
        this.initUserList();
        this.userService.getUserFormFields().subscribe(
            fields => {
                this.formFields = fields;
                this.customFieldsRowsIdx = [];
                for (let i = 0; i < Math.round(this.formFields.customFields.length/2); i++) {
                    this.customFieldsRowsIdx.push(i);
                }
            }
        );
    }

    private initUserList() {
        this.selectedUser = null;
        this.userService.listUsers().subscribe(
            users => {
                this.users = users;
            }
        );
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
        let status = user.getStatus();
        return (
            (this.showActive && status == UserStatusEnum.ACTIVE) ||
            (this.showInactive && status == UserStatusEnum.INACTIVE) ||
            (this.showNew && status == UserStatusEnum.NEW)
        );
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
        //user cannot change status to himself or to an administrator user
        return VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail() || this.selectedUser.isAdmin();
    }

    private changeUserStatus() {
        if (this.selectedUser.isAdmin()) { //check performed for robustness, this should never happen since it is forbidden by the UI
            this.basicModals.alert("Change user status", "Cannot change the status of an administrator. " + 
                "Please revoke the administrator authority first and retry", "warning");
            return;
        }
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

    private isChangeAdminButtonDisabled() {
        //cannot change the admin status to the same logged user and to non-active user
        return VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail() || this.selectedUser.getStatus() != UserStatusEnum.ACTIVE;
    }

    private changeAdministratorStatus() {
        if (this.selectedUser.isAdmin()) { //revoke administator
            //check if there is another admin
            let adminCount = 0;
            this.users.forEach(u => {
                if (u.isAdmin()) adminCount++;
            });
            if (adminCount < 2) {
                this.basicModals.alert("Revoke administrator", "Cannot revoke the administrator authority to the selected user. There is only one administrator", "warning");
                return;
            } else {
                this.basicModals.confirm("Revoke administrator", "You are revoking the administrator authority to " + this.selectedUser.getShow() + ". Are you sure?", "warning").then(
                    confirm => {
                        this.administrationServices.removeAdministrator(this.selectedUser.getEmail()).subscribe(
                            user => {
                                this.selectedUser.setAdmin(false);
                            }
                        );
                    }, 
                    cancel => {}
                );
            }
            
        } else { //assign administrator
            if (this.selectedUser.getStatus() != UserStatusEnum.ACTIVE) { //only active user can be administator
                this.basicModals.alert("Add administrator", "Cannot grant the administrator authority to a non-active user. Please, activate the user and retry", "warning");
                return;
            }
            this.basicModals.confirm("Revoke administrator", "You are granting the administrator authority to " + this.selectedUser.getShow() + ". Are you sure?", "warning").then(
                confirm => {
                    this.administrationServices.setAdministrator(this.selectedUser.getEmail()).subscribe(
                        user => {
                            this.selectedUser.setAdmin(true);
                        }
                    );
                }
            );
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