import { Component, EventEmitter, Output } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { User, UserStatusEnum } from "../../models/User";
import { UserServices } from "../../services/userServices";
import { UserCreateModal } from "./userCreateModal";

@Component({
    selector: "users-list",
    templateUrl: "./usersListComponent.html",
    host: { class: "vbox" },
    styles: [`
        .online { color: green; font-weight: bold; } 
        .inactive { color: red; font-weight: bold; }
        .offline { color: lightgray }
        .filter-dropdown > .dropdown-menu {
            min-width: 350px;
        }
    `]
})
export class UsersListComponent {
    @Output() userSelected: EventEmitter<User> = new EventEmitter();

    users: User[];
    selectedUser: User;

    userSort: UserSortOpt[] = [
        { value: UserSort.email_asc, translationKey: "USER.SORTING.EMAIL_ASC", icon: "sort-alpha-down" },
        { value: UserSort.email_desc, translationKey: "USER.SORTING.EMAIL_DESC", icon: "sort-alpha-up" },
        { value: UserSort.name_asc, translationKey: "USER.SORTING.NAME_ASC", icon: "sort-alpha-down" },
        { value: UserSort.name_desc, translationKey: "USER.SORTING.NAME_DESC", icon: "sort-alpha-up" },
        { value: UserSort.registered_asc, translationKey: "USER.SORTING.REGISTRATION_DATE_ASC", icon: "sort-numeric-down" },
        { value: UserSort.registered_desc, translationKey: "USER.SORTING.REGISTRATION_DATE_DESC", icon: "sort-numeric-up" },
    ];
    selectedUserSort: UserSort = UserSort.name_asc;

    showActive: boolean = true;
    showInactive: boolean = true;
    showNew: boolean = true;

    showOnlyOnline: boolean = false;

    givenNameFilter: string = "";
    familyNameFilter: string = "";
    emailFilter: string = "";


    constructor(private userService: UserServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.initUserList();
    }


    /** ==========================
     * Users management
     * =========================== */

    private initUserList() {
        this.selectedUser = null;
        this.userService.listUsers().subscribe(
            users => {
                this.users = users;
            }
        );
    }

    sort(sortBy: UserSort) {
        this.selectedUserSort = sortBy;
        if (sortBy == UserSort.name_asc) {
            this.users.sort((u1, u2) => u1.getGivenName().localeCompare(u2.getGivenName()));
        } else if (sortBy == UserSort.name_desc) {
            this.users.sort((u1, u2) => u2.getGivenName().localeCompare(u1.getGivenName()));
        } else if (sortBy == UserSort.email_asc) {
            this.users.sort((u1, u2) => u1.getEmail().localeCompare(u2.getEmail()));
        } else if (sortBy == UserSort.email_desc) {
            this.users.sort((u1, u2) => u2.getGivenName().localeCompare(u1.getGivenName()));
        } else if (sortBy == UserSort.registered_asc) {
            this.users.sort((u1, u2) => { return u1.getRegistrationDate() > u2.getRegistrationDate() ? 1 : -1; });
        } else if (sortBy == UserSort.registered_desc) {
            this.users.sort((u1, u2) => { return u1.getRegistrationDate() > u2.getRegistrationDate() ? -1 : 1; });
        }
    }

    selectUser(user: User) {
        if (this.selectedUser != user) {
            this.selectedUser = user;
            this.userSelected.emit(this.selectedUser);
        }
    }

    createUser() {
        this.modalService.open(UserCreateModal, new ModalOptions('lg')).result.then(
            () => {
                this.initUserList();
            },
            () => { }
        );
    }

    isFilterApplied(): boolean {
        return !this.showActive || !this.showInactive || !this.showNew || 
            this.givenNameFilter != "" || this.familyNameFilter != "" || this.emailFilter != "" || 
            this.showOnlyOnline;
    }

    /**
     * Based on filters "enabled" "disabled" "new" tells whether the user should be visible.
     */
    isUserVisible(user: User): boolean {
        let statusCheck: boolean = (this.showActive && user.getStatus() == UserStatusEnum.ACTIVE) ||
            (this.showInactive && user.getStatus() == UserStatusEnum.INACTIVE) ||
            (this.showNew && user.getStatus() == UserStatusEnum.NEW);
        let givenNameCheck: boolean = this.givenNameFilter == "" || user.getGivenName().toLocaleLowerCase().includes(this.givenNameFilter.toLocaleLowerCase());
        let familyNameCheck: boolean = this.familyNameFilter == "" || user.getFamilyName().toLocaleLowerCase().includes(this.familyNameFilter.toLocaleLowerCase());
        let emailCheck: boolean = this.emailFilter == "" || user.getEmail().toLocaleLowerCase().includes(this.emailFilter.toLocaleLowerCase());
        let onlineCheck: boolean = !this.showOnlyOnline || user.isOnline();
        return statusCheck && givenNameCheck && familyNameCheck && emailCheck && onlineCheck;
    }

}

interface UserSortOpt {
    value: UserSort;
    translationKey: string;
    icon: string;
}

enum UserSort {
    name_asc = "name_asc",
    name_desc = "name_desc",
    email_asc = "email_asc",
    email_desc = "email_desc",
    registered_asc = "registered_asc",
    registered_desc = "registered_desc",
}