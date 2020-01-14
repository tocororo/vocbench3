import { Component, EventEmitter, Input, Output } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { User, UserStatusEnum } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { UserServices } from "../../services/userServices";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ForcePasswordModal, ForcePasswordModalData } from "./forcePasswordModal";

@Component({
    selector: "user-details-panel",
    templateUrl: "./userDetailsPanelComponent.html",
    host: { class: "vbox" }
})
export class UserDetailsPanelComponent {
    @Input() user: User;
    @Output() deleted: EventEmitter<void> = new EventEmitter();

    constructor(private userService: UserServices, private administrationServices: AdministrationServices,
        private basicModals: BasicModalServices, private modal: Modal) { }

    private isUserActive(): boolean {
        return this.user.getStatus() == UserStatusEnum.ACTIVE;
    }

    private isChangeStatusButtonDisabled() {
        //user cannot change status to himself or to an administrator user
        return VBContext.getLoggedUser().getEmail() == this.user.getEmail() || this.user.isAdmin();
    }

    private changeUserStatus() {
        if (this.user.isAdmin()) { //check performed for robustness, this should never happen since it is forbidden by the UI
            this.basicModals.alert("Change user status", "Cannot change the status of an administrator. " + 
                "Please revoke the administrator authority first and retry", "warning");
            return;
        }
        var enabled = this.user.getStatus() == UserStatusEnum.ACTIVE;
        if (enabled) {
            this.userService.enableUser(this.user.getEmail(), false).subscribe(
                user => {
                    this.user.setStatus(UserStatusEnum.INACTIVE);
                }
            );
        } else {
            this.userService.enableUser(this.user.getEmail(), true).subscribe(
                user => {
                    this.user.setStatus(UserStatusEnum.ACTIVE);
                }
            )
        }
    }

    private isChangeAdminButtonDisabled() {
        //cannot change the admin status to the same logged user and to non-active user
        return VBContext.getLoggedUser().getEmail() == this.user.getEmail() || this.user.getStatus() != UserStatusEnum.ACTIVE;
    }

    private changeAdministratorStatus() {
        if (this.user.isAdmin()) { //revoke administator
            //check if there is another admin
            let adminCount = 0;

            this.userService.listUsers().subscribe(
                users => {
                    let adminCount = users.map(u => u.isAdmin).length;
                    if (adminCount < 2) {
                        this.basicModals.alert("Revoke administrator", "Cannot revoke the administrator authority to the selected user. There is only one administrator", "warning");
                        return;
                    } else {
                        this.basicModals.confirm("Revoke administrator", "You are revoking the administrator authority to " + this.user.getShow() + ". Are you sure?", "warning").then(
                            confirm => {
                                this.administrationServices.removeAdministrator(this.user.getEmail()).subscribe(
                                    user => {
                                        this.user.setAdmin(false);
                                    }
                                );
                            }, 
                            cancel => {}
                        );
                    }
                }
            );
        } else { //assign administrator
            if (this.user.getStatus() != UserStatusEnum.ACTIVE) { //only active user can be administator
                this.basicModals.alert("Add administrator", "Cannot grant the administrator authority to a non-active user. Please, activate the user and retry", "warning");
                return;
            }
            this.basicModals.confirm("Revoke administrator", "You are granting the administrator authority to " + this.user.getShow() + ". Are you sure?", "warning").then(
                confirm => {
                    this.administrationServices.setAdministrator(this.user.getEmail()).subscribe(
                        user => {
                            this.user.setAdmin(true);
                        }
                    );
                }
            );
        }
    }

    private isDeleteButtonDisabled() {
        //user cannot delete himself
        return VBContext.getLoggedUser().getEmail() == this.user.getEmail();
    }

    private deleteUser() {
        this.basicModals.confirm("Delete user", "You are deleting user "
            + this.user.getShow() + ". Are you sure?", "warning").then(
            () => {
                this.userService.deleteUser(this.user.getEmail()).subscribe(
                    () => {
                        this.deleted.emit();
                    }
                );
            },
            () => {}
        );
    }

    private isChangePwdButtonDisabled() {
        //admin cannot change its password
        return VBContext.getLoggedUser().getEmail() == this.user.getEmail();
    }

    private changePassword() {
        var modalData = new ForcePasswordModalData(this.user);
        const builder = new BSModalContextBuilder<ForcePasswordModalData>(
            modalData, undefined, ForcePasswordModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ForcePasswordModal, overlayConfig).result.then();
    }

}