import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { User } from "../../../../models/User";
import { AdministrationServices } from "../../../../services/administrationServices";
import { UserServices } from "../../../../services/userServices";
import { VBContext } from "../../../../utils/VBContext";

export class UserSelectionModalData extends BSModalContext {
    constructor(public title: string = 'Select user', public projectDepending: boolean = false, public unselectableUsers: User[] = []) {
        super();
    }
}

@Component({
    selector: "user-selection-modal",
    templateUrl: "./userSelectionModal.html",
})
export class UserSelectionModal implements ModalComponent<UserSelectionModalData> {
    context: UserSelectionModalData;

    private userList: User[] = [];
    private selectedUser: User;

    constructor(public dialog: DialogRef<UserSelectionModalData>, public userService: UserServices, public adminService: AdministrationServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.projectDepending) {
            this.userService.listUsersBoundToProject(VBContext.getWorkingProject().getName()).subscribe(
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

    private selectUser(user: User) {
        if (this.isUserSelectable(user)) {
            if (this.selectedUser == user) {
                this.selectedUser = null;
            } else {
                this.selectedUser = user;
            }
        }
    }

    private isUserSelectable(user: User): boolean {
        for (var i = 0; i < this.context.unselectableUsers.length; i++) {
            if (user.getEmail() == this.context.unselectableUsers[i].getEmail()) {
                return false;
            }
        }
        return true;
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedUser);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}