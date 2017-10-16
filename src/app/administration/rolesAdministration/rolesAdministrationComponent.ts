import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { CapabilityEditorModal, CapabilityEditorModalData } from "./capabilityEditorModal";
import { ImportRoleModal, ImportRoleModalData } from "./importRoleModal";
import { AdministrationServices } from "../../services/administrationServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { Role } from "../../models/User";
import { Project } from "../../models/Project";
import { VBContext } from "../../utils/VBContext";

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
    private capabilityList: string[];
    private selectedCapability: string;

    constructor(private adminService: AdministrationServices, private basicModals: BasicModalServices, private modal: Modal) { }

    ngOnInit() {
        this.initRoles();
    }

    private initRoles() {
        this.adminService.listRoles(VBContext.getWorkingProject()).subscribe(
            roles => {
                this.roleList = roles;
                this.selectedRole = null;
                this.capabilityList = [];
            }
        );
    }

    private initCapabilities() {
        this.adminService.listCapabilities(this.selectedRole, VBContext.getWorkingProject()).subscribe(
            capabilities => {
                this.capabilityList = capabilities;
                this.selectedCapability = null;
            }
        );
    }

    private isProjectOpen(): boolean {
        return VBContext.getWorkingProject() != null;
    }

    private selectRole(role: Role) {
        this.selectedRole = role;
        this.initCapabilities();
    }

    private createRole() {
        this.basicModals.prompt("Create role", "Role name", null, null, false, true).then(
            (result: any) => {
                if (this.roleExists(result)) {
                    this.basicModals.alert("Duplicated role", "A role with the same name (" + result + ") already exists", "error");
                    return;
                }
                this.adminService.createRole(result).subscribe(
                    stResp => {
                        this.initRoles();
                    }
                );
            },
            () => { }
        )
    }

    private deleteRole() {
        this.adminService.deleteRole(this.selectedRole.getName()).subscribe(
            stResp => {
                this.initRoles();
            }
        )
    }

    private importRole() {
        var modalData = new ImportRoleModalData("Import Role");
        const builder = new BSModalContextBuilder<ImportRoleModalData>(
            modalData, undefined, ImportRoleModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(ImportRoleModal, overlayConfig).result.then(
            (data: any) => {
                if (this.roleExists(data.name)) {
                    this.basicModals.alert("Duplicated role", "A role with the same name (" + data.name + ") already exists", "error");
                    return;
                }
                this.adminService.importRole(data.file, data.name).subscribe(
                    stResp => {
                        this.initRoles();
                    }
                );
            },
            () => {}
        );
    }

    private exportRole() {
        this.adminService.exportRole(this.selectedRole.getName()).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink("Export Role", null, exportLink, "role_" + this.selectedRole.getName() + ".pl");
            }
        )
    }

    private cloneRole() {
        this.basicModals.prompt("Clone role " + this.selectedRole.getName(), "Role name", null, null, false, true).then(
            (newRoleName: any) => {
                if (this.roleExists(newRoleName)) {
                    this.basicModals.alert("Duplicated role", "A role with the same name (" + newRoleName + ") already exists", "error");
                    return;
                }
                this.adminService.cloneRole(this.selectedRole.getName(), newRoleName).subscribe(
                    stResp => {
                        this.initRoles();
                    }
                );
            },
            () => { }
        )
    }

    private roleExists(roleName: string): boolean {
        for (var i = 0; i < this.roleList.length; i++) {
            if (this.roleList[i].getName() == roleName) {
                return true;
            }
        }
        return false;
    }

    private selectCapability(capability: string) {
        this.selectedCapability = capability;
    }

    private addCapability() {
        var modalData = new CapabilityEditorModalData("Add capability to " + this.selectedRole.getName());
        const builder = new BSModalContextBuilder<CapabilityEditorModalData>(
            modalData, undefined, CapabilityEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(CapabilityEditorModal, overlayConfig).result.then(
            (capability: any) => {
                if (this.capabilityList.indexOf(capability) != -1) {
                    this.basicModals.alert("Duplicated capability", "Capability " + capability + 
                        " already exists in role " + this.selectedRole.getName(), "error").then();
                    return;
                }
                this.adminService.addCapabilityToRole(this.selectedRole.getName(), capability).subscribe(
                    stResp => {
                        this.selectedCapability = null;
                        this.initCapabilities();
                    }
                );
            },
            () => {}
        );
    }

    private removeCapability() {
        this.adminService.removeCapabilityFromRole(this.selectedRole.getName(), this.selectedCapability).subscribe(
            stResp => {
                this.selectedCapability = null;
                this.initCapabilities();
            }
        );
    }

    private editCapability() {
        var modalData = new CapabilityEditorModalData("Edit capability", this.selectedCapability);
        const builder = new BSModalContextBuilder<CapabilityEditorModalData>(
            modalData, undefined, CapabilityEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(CapabilityEditorModal, overlayConfig).result.then(
            (capability: any) => {
                if (this.capabilityList.indexOf(capability) != -1) {
                    this.basicModals.alert("Duplicated capability", "Capability " + capability + 
                        " already exists in role " + this.selectedRole.getName(), "error").then();
                    return;
                }
                this.adminService.updateCapabilityForRole(this.selectedRole.getName(), this.selectedCapability, capability).subscribe(
                    stResp => {
                        this.selectedCapability = null;
                        this.initCapabilities();
                    }
                );
            },
            () => {}
        );
    }
    

}