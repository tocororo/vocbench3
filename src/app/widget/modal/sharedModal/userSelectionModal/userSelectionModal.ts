import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from "../../../../models/User";
import { AdministrationServices } from "../../../../services/administrationServices";
import { UserServices } from "../../../../services/userServices";
import { VBContext } from "../../../../utils/VBContext";

@Component({
    selector: "user-selection-modal",
    templateUrl: "./userSelectionModal.html",
})
export class UserSelectionModal {
    @Input() title: string = "Select user";
    @Input() projectDepending: boolean;
    @Input() unselectableUsers: User[] = [];

    userList: User[] = [];
    selectedUser: User;

    constructor(public activeModal: NgbActiveModal, public userService: UserServices, public adminService: AdministrationServices) {}

    ngOnInit() {
        if (this.projectDepending) {
            this.userService.listUsersBoundToProject(VBContext.getWorkingProject()).subscribe(
                users => {
                    this.userList = users;
                }
            );
        } else {
            this.userService.listUsers().subscribe(
                users => {
                    this.userList = users;
                }
            );
        }
        
    }

    selectUser(user: User) {
        if (this.isUserSelectable(user)) {
            if (this.selectedUser == user) {
                this.selectedUser = null;
            } else {
                this.selectedUser = user;
            }
        }
    }

    private isUserSelectable(user: User): boolean {
        for (let i = 0; i < this.unselectableUsers.length; i++) {
            if (user.getEmail() == this.unselectableUsers[i].getEmail()) {
                return false;
            }
        }
        return true;
    }

    ok() {
        this.activeModal.close(this.selectedUser);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}