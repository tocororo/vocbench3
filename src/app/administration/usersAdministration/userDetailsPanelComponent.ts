import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { User, UserStatusEnum } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { UserServices } from "../../services/userServices";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ForcePasswordModal } from "./forcePasswordModal";

@Component({
    selector: "user-details-panel",
    templateUrl: "./userDetailsPanelComponent.html",
    host: { class: "vbox" }
})
export class UserDetailsPanelComponent {
    @Input() user: User;
    @Output() deleted: EventEmitter<void> = new EventEmitter();

    constructor(private userService: UserServices, private administrationServices: AdministrationServices,
        private basicModals: BasicModalServices, private modalService: NgbModal) { }

    private isUserActive(): boolean {
        return this.user.getStatus() == UserStatusEnum.ACTIVE;
    }

    private isChangeStatusButtonDisabled() {
        //user cannot change status to himself or to an administrator user
        return VBContext.getLoggedUser() && (VBContext.getLoggedUser().getEmail() == this.user.getEmail() || this.user.isAdmin());
    }

    private changeUserStatus() {
        if (this.user.isAdmin()) { //check performed for robustness, this should never happen since it is forbidden by the UI
            this.basicModals.alert({key:"STATUS.OPERATION_DENIED"}, {key:"MESSAGES.CANNOT_CHANGE_ADMIN_STATUS"}, ModalType.warning);
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
        return VBContext.getLoggedUser() && (VBContext.getLoggedUser().getEmail() == this.user.getEmail() || this.user.getStatus() != UserStatusEnum.ACTIVE);
    }

    private changeAdministratorStatus() {
        if (this.user.isAdmin()) { //revoke administator
            //check if there is another admin
            let adminCount = 0;

            this.userService.listUsers().subscribe(
                users => {
                    let adminCount = users.map(u => u.isAdmin).length;
                    if (adminCount < 2) {
                        this.basicModals.alert({key:"ADMINISTRATION.ACTIONS.REVOKE_ADMINISTRATOR"}, {key:"MESSAGES.CANNOT_REVOKE_ADMIN_AUTHORITY"}, ModalType.warning);
                        return;
                    } else {
                        this.basicModals.confirm({key:"ADMINISTRATION.ACTIONS.REVOKE_ADMINISTRATOR"}, {key:"MESSAGES.REVOKING_ADMIN_CONFIRM", params: {user: this.user.getShow()}}, ModalType.warning).then(
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
                this.basicModals.alert({key:"ADMINISTRATION.ACTIONS.ADD_ADMINISTRATOR"}, {key:"MESSAGES.CANNOT_GRANT_ADMIN_TO_INACTIVE_USER"}, ModalType.warning);
                return;
            }
            this.basicModals.confirm({key:"ADMINISTRATION.ACTIONS.ADD_ADMINISTRATOR"}, {key:"MESSAGES.GRANTING_ADMIN_CONFIRM", params: {user: this.user.getShow()}}, ModalType.warning).then(
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
        return VBContext.getLoggedUser() && (VBContext.getLoggedUser().getEmail() == this.user.getEmail());
    }

    private deleteUser() {
        this.basicModals.confirm({key:"ADMINISTRATION.ACTIONS.DELETE_USER"}, {key:"MESSAGES.DELETE_USER_CONFIRM", params:{user: this.user.getShow()}}, ModalType.warning).then(
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
        return VBContext.getLoggedUser() && (VBContext.getLoggedUser().getEmail() == this.user.getEmail());
    }

    private changePassword() {
        const modalRef: NgbModalRef = this.modalService.open(ForcePasswordModal, new ModalOptions());
        modalRef.componentInstance.user = this.user;
        return modalRef.result;
    }

}