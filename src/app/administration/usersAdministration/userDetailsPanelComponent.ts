import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { map, mergeMap, tap } from "rxjs/operators";
import { Cookie } from "src/app/utils/Cookie";
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

    isUserActive(): boolean {
        return this.user.getStatus() == UserStatusEnum.ACTIVE;
    }

    isChangeStatusButtonDisabled() {
        //user cannot change status to himself or to an administrator user
        return VBContext.getLoggedUser() && (VBContext.getLoggedUser().getEmail() == this.user.getEmail() || this.user.isAdmin());
    }

    changeUserStatus() {
        if (this.user.isAdmin()) { //check performed for robustness, this should never happen since it is forbidden by the UI
            this.basicModals.alert({ key: "STATUS.OPERATION_DENIED" }, { key: "MESSAGES.CANNOT_CHANGE_ADMIN_STATUS" }, ModalType.warning);
            return;
        }
        let enabled = this.user.getStatus() == UserStatusEnum.ACTIVE;
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
            );
        }
    }

    isChangeTypeButtonDisabled() {
        //user cannot change status to himself
        return VBContext.getLoggedUser() && VBContext.getLoggedUser().getEmail() == this.user.getEmail();
    }

    changeUserType(type?: UserType) {
        let removeOldRoleFn: Observable<boolean>; //boolean tells if the remove operation has gone well (e.g. if the only admin tries to remove itself, returns false)
        if (this.user.isAdmin() && type != "admin") {
            removeOldRoleFn = this.userService.listUsers().pipe(
                mergeMap(users => {
                    let adminCount = users.filter(u => u.isAdmin()).length;
                    if (adminCount < 2) {
                        this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.CANNOT_REVOKE_ADMIN_AUTHORITY" }, ModalType.warning);
                        return of(false);
                    } else {
                        return this.administrationServices.removeAdministrator(this.user).pipe(
                            map(() => { 
                                this.user.setAdmin(false);
                                return true;
                            })
                        );
                    }
                })
            );
        }
        if (this.user.isSuperUser() && type != "su") {
            removeOldRoleFn = this.administrationServices.removeSuperUser(this.user).pipe(
                map(() => {
                    this.user.setSuperUser(false);
                    return true;
                })
            );
        }

        let setNewRoleFn: Observable<void>;
        if (type == "admin") {
            setNewRoleFn = this.administrationServices.setAdministrator(this.user).pipe(tap(() => this.user.setAdmin(true)));
        } else if (type == "su") {
            setNewRoleFn = this.administrationServices.setSuperUser(this.user).pipe(tap(() => this.user.setSuperUser(true)));
        }

        if (removeOldRoleFn || setNewRoleFn) {
            let msgKey = this.getChangeUserTypeWarningMsg(type);
            this.basicModals.confirmCheckCookie({ key: "STATUS.WARNING" }, { key: msgKey, params: { user: this.user.getShow() } }, Cookie.WARNING_ADMIN_CHANGE_USER_TYPE, ModalType.warning).then(
                () => {
                    if (removeOldRoleFn) {
                        removeOldRoleFn.subscribe(
                            (success: boolean) => {
                                if (success && setNewRoleFn != null) {
                                    setNewRoleFn.subscribe();
                                }
                            }
                        );
                    } else {
                        if (setNewRoleFn) {
                            setNewRoleFn.subscribe();
                        }
                    }
                },
                () => { }
            );
        }

    }

    private getChangeUserTypeWarningMsg(role?: UserType): string {
        let msg: string;
        if (this.user.isAdmin()) {
            if (role == "su") {
                msg = "MESSAGES.CHANGE_USER_TYPE_ADMIN_TO_SUPER_CONFIRM";
            } else if (role == null) {
                msg = "MESSAGES.CHANGE_USER_TYPE_ADMIN_TO_USER_CONFIRM";
            }
        } else if (this.user.isSuperUser()) {
            if (role == "admin") {
                msg = "MESSAGES.CHANGE_USER_TYPE_SUPER_TO_ADMIN_CONFIRM";
            } else if (role == null) {
                msg = "MESSAGES.CHANGE_USER_TYPE_SUPER_TO_USER_CONFIRM";
            }
        } else { //nor admin or superuser
            if (role == "admin") {
                msg = "MESSAGES.CHANGE_USER_TYPE_USER_TO_ADMIN_CONFIRM";
            } else if (role == "su") {
                msg = "MESSAGES.CHANGE_USER_TYPE_USER_TO_SUPER_CONFIRM";
            }
        }
        //other cases are not foreseen since this method is invoked only in role != user type
        return msg;
    }

    isDeleteButtonDisabled() {
        //user cannot delete himself
        return VBContext.getLoggedUser() && (VBContext.getLoggedUser().getEmail() == this.user.getEmail());
    }

    deleteUser() {
        this.basicModals.confirm({ key: "ADMINISTRATION.ACTIONS.DELETE_USER" }, { key: "MESSAGES.DELETE_USER_CONFIRM", params: { user: this.user.getShow() } }, ModalType.warning).then(
            () => {
                this.userService.deleteUser(this.user.getEmail()).subscribe(
                    () => {
                        this.deleted.emit();
                    }
                );
            },
            () => { }
        );
    }

    isChangePwdButtonDisabled() {
        //admin cannot change its password
        return VBContext.getLoggedUser() && (VBContext.getLoggedUser().getEmail() == this.user.getEmail());
    }

    changePassword() {
        const modalRef: NgbModalRef = this.modalService.open(ForcePasswordModal, new ModalOptions());
        modalRef.componentInstance.user = this.user;
        return modalRef.result;
    }

}

type UserType = "admin" | "su";