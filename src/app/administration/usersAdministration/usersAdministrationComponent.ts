import { Component } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { User, UserFormFields, UserStatusEnum } from "../../models/User";
import { UserServices } from "../../services/userServices";
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

    private showActive: boolean = true;
    private showInactive: boolean = true;
    private showNew: boolean = true;

    constructor(private userService: UserServices, private modal: Modal) { }

    ngOnInit() {
        this.initUserList();
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

}