import { Component } from "@angular/core";

import { AdministrationServices } from "../services/administrationServices";
import { ModalServices } from "../widget/modal/modalServices";
import { Role } from "../utils/User";

@Component({
    selector: "roles-admin-component",
    templateUrl: "./rolesAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class RolesAdministrationComponent {

    //Role list panel
    private roleList: Role[];
    private selectedRole: Role;

    //Role capabilities panel
    private selectedRoleCapability: string;

    //Available capabilities panel
    private capabilityList: string[];
    private selectedCapability: string;

    constructor(private adminService: AdministrationServices, private modalService: ModalServices) { }

    ngOnInit() {
        this.initRoles();
        this.initCapabilities();
    }

    private initRoles() {
        this.adminService.listRoles().subscribe(
            roles => {
                this.roleList = roles;
            }
        );
    }

    private initCapabilities() {
        this.adminService.listCapabilities().subscribe(
            capabilities => {
                this.capabilityList = capabilities;
            }
        )
    }

    private selectRole(role: Role) {
        this.selectedRole = role;
        this.selectedCapability = null;
    }

    private createRole() {
        this.modalService.prompt("Create role", "Role name").then(
            result => {
                this.adminService.createRole(result).subscribe(
                    stResp => {
                        this.initRoles();
                    }
                );
            },
            () => {}
        )
    }

    private deleteRole() {
        this.adminService.deleteRole(this.selectedRole.getName()).subscribe(
            stResp => {
                this.initRoles();
            }
        )
    }

    private selectRoleCapability(capability: string) {
        this.selectedRoleCapability = capability;
    }

    private selectCapability(capability: string) {
        if (!this.isCapabilityAlreadyAssigned(capability)) {
            this.selectedCapability = capability;
        }
    }

    private isCapabilityAlreadyAssigned(capability: string): boolean {
        if (this.selectedRole == undefined) {
            return true;
        }
        return this.selectedRole.getCapabilities().indexOf(capability) != -1;
    }

    private addCapability() {
        this.adminService.addCapabilityToRole(this.selectedRole.getName(), this.selectedCapability).subscribe(
            stResp => {
                this.selectedRole.addCapability(this.selectedCapability);
                this.selectedCapability = null;
            }
        )
    }

    private removeCapability() {
        this.adminService.removeCapabilityFromRole(this.selectedRole.getName(), this.selectedRoleCapability).subscribe(
            stResp => {
                this.selectedRole.removeCapability(this.selectedRoleCapability);
                this.selectedRoleCapability = null;
            }
        );
    }

}