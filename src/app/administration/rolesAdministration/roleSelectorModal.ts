import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project } from "src/app/models/Project";
import { Role } from "src/app/models/User";
import { AdministrationServices } from "src/app/services/administrationServices";

@Component({
    selector: "role-selector-modal",
    templateUrl: "./roleSelectorModal.html",
})
export class RoleSelectorModal {
    @Input() title: string;
    @Input() project: Project;
    @Input() roles: Role[]; //selected roles at init
    @Input() multiselection: boolean = false;
    @Input() requireSelection: boolean = false;

    roleItems: RoleItem[] = [];

    constructor(public activeModal: NgbActiveModal, private adminService: AdministrationServices) {}

    ngOnInit() {
        this.adminService.listRoles(this.project).subscribe(
            roles => {
                roles.forEach(r => {
                    let selected: boolean = false;
                    if (this.multiselection && this.roles && this.roles.length > 0) {
                        selected = this.roles.some(rInput => rInput.getLevel() == r.getLevel() && rInput.getName() == r.getName());
                    } else if (!this.multiselection && this.roles && this.roles.length == 1) {
                        selected = this.roles[0].getLevel() == r.getLevel() && this.roles[0].getName() == r.getName();
                    }
                    this.roleItems.push({
                        role: r,
                        selected: selected
                    });
                });
            }
        );
    }

    selectRole(role: RoleItem) {
        if (this.multiselection) {
            role.selected = !role.selected;
        } else {
            this.roleItems.forEach(r => {
                if (r == role) {
                    r.selected = true;
                } else {
                    r.selected = false;
                }
            });
        }
    }

    isDataValid(): boolean {
        return !this.requireSelection || this.roleItems.some(l => l.selected);
    }

    ok() {
        this.activeModal.close(this.roleItems.filter(r => r.selected).map(r => r.role));
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

interface RoleItem {
    role: Role;
    selected: boolean;
}