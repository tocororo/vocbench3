import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { CapabilityEditorModal, CapabilityEditorModalData } from "./administrationModals/capabilityEditorModal";
import { ImportRoleModal, ImportRoleModalData } from "./administrationModals/importRoleModal";
import { AdministrationServices } from "../services/administrationServices";
import { ModalServices } from "../widget/modal/modalServices";
import { Role } from "../models/User";
import { Project } from "../models/Project";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "roles-admin-component",
    templateUrl: "./rolesAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class RolesAdministrationComponent {

    private project: Project;

    //Role list panel
    private roleList: Role[];
    private selectedRole: Role;

    //Role capabilities panel
    private capabilityList: string[];
    private selectedCapability: string;

    constructor(private adminService: AdministrationServices, private modalService: ModalServices, private modal: Modal) { }

    ngOnInit() {
        this.project = VBContext.getWorkingProject();
        this.initRoles();
    }

    private initRoles() {
        this.adminService.listRoles(this.project).subscribe(
            roles => {
                this.roleList = roles;
                this.selectedRole = null;
                this.capabilityList = [];
            }
        );
    }

    private initCapabilities() {
        this.adminService.listCapabilities(this.selectedRole, this.project).subscribe(
            capabilities => {
                this.capabilityList = capabilities;
                this.selectedCapability = null;
            }
        );
    }

    private selectRole(role: Role) {
        this.selectedRole = role;
        this.initCapabilities();
    }

    private createRole() {
        this.modalService.prompt("Create role", "Role name", null, null, false, true).then(
            (result: any) => {
                if (this.roleExists(result)) {
                    this.modalService.alert("Duplicated role", "A role with the same name (" + result + ") already exists", "error");
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
        this.modal.open(ImportRoleModal, overlayConfig).then(
            dialog => dialog.result.then(
                (data: any) => {
                    if (this.roleExists(data.name)) {
                        this.modalService.alert("Duplicated role", "A role with the same name (" + data.name + ") already exists", "error");
                        return;
                    }
                    this.adminService.importRole(data.file, data.name).subscribe(
                        stResp => {
                            this.initRoles();
                        }
                    );
                }
            )
        );
    }

    private exportRole() {
        this.adminService.exportRole(this.selectedRole.getName()).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.modalService.downloadLink("Export Role", null, exportLink, "role_" + this.selectedRole.getName() + ".pl");
            }
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
        return this.modal.open(CapabilityEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                (capability: any) => {
                    if (this.capabilityList.indexOf(capability) != -1) {
                        this.modalService.alert("Duplicated capability", "Capability " + capability + 
                            " already exists in role " + this.selectedRole.getName(), "error").then();
                        return;
                    }
                    this.adminService.addCapabilityToRole(this.selectedRole.getName(), capability).subscribe(
                        stResp => {
                            this.selectedCapability = null;
                            this.initCapabilities();
                        }
                    );
                }
            )
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
        return this.modal.open(CapabilityEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                (capability: any) => {
                    if (this.capabilityList.indexOf(capability) != -1) {
                        this.modalService.alert("Duplicated capability", "Capability " + capability + 
                            " already exists in role " + this.selectedRole.getName(), "error").then();
                        return;
                    }
                    this.adminService.updateCapabilityForRole(this.selectedRole.getName(), this.selectedCapability, capability).subscribe(
                        stResp => {
                            this.selectedCapability = null;
                            this.initCapabilities();
                        }
                    );
                }
            )
        );
    }
    

}