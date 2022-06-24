import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import * as FileSaver from 'file-saver';
import { ModalOptions, ModalType, Translation } from 'src/app/widget/modal/Modals';
import { Role } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CapabilityEditorModal } from "./capabilityEditorModal";
import { ImportRoleModal } from "./importRoleModal";

@Component({
    selector: "roles-admin-component",
    templateUrl: "./rolesAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class RolesAdministrationComponent {

    //Role list panel
    roleList: Role[];
    selectedRole: Role;

    //Role capabilities panel
    private capabilityList: string[];
    selectedCapability: string;

    constructor(private adminService: AdministrationServices, private basicModals: BasicModalServices, private modalService: NgbModal,
        private translateService: TranslateService) { }

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

    isProjectOpen(): boolean {
        return VBContext.getWorkingProject() != null;
    }

    selectRole(role: Role) {
        this.selectedRole = role;
        this.initCapabilities();
    }

    getCreateRoleTitle(): string {
        if (this.isProjectOpen()) {
            return "Create a new role";
        } else {
            return "Custom roles can only be created in the context of a project;" +
                " in order to create a new role access a project and then create the role for that project";
        }
    }

    createRole() {
        this.basicModals.prompt({ key: "ACTIONS.CREATE_ROLE" }, { value: "Role name" }, null, null, false, true).then(
            (result: string) => {
                if (this.roleExists(result)) {
                    this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.ALREADY_EXISTING_ROLE_NAME" }, ModalType.warning);
                    return;
                }
                this.adminService.createRole(result).subscribe(
                    () => {
                        this.initRoles();
                    }
                );
            },
            () => { }
        );
    }

    deleteRole() {
        this.adminService.deleteRole(this.selectedRole.getName()).subscribe(
            () => {
                this.initRoles();
            }
        );
    }

    importRole() {
        this.modalService.open(ImportRoleModal, new ModalOptions()).result.then(
            (data: any) => {
                if (this.roleExists(data.name)) {
                    this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.ALREADY_EXISTING_ROLE_NAME" }, ModalType.warning);
                    return;
                }
                this.adminService.importRole(data.file, data.name).subscribe(
                    () => {
                        this.initRoles();
                    }
                );
            },
            () => { }
        );
    }

    exportRole() {
        this.adminService.exportRole(this.selectedRole.getName()).subscribe(
            blob => {
                FileSaver.saveAs(blob, "role_" + this.selectedRole.getName() + ".pl");
            }
        );
    }

    cloneRole() {
        this.basicModals.prompt({ key: "ACTIONS.CLONE_ROLE" }, { value: "Role name" }, null, null, false, true).then(
            (newRoleName: any) => {
                if (this.roleExists(newRoleName)) {
                    this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.ALREADY_EXISTING_ROLE_NAME" }, ModalType.warning);
                    return;
                }
                this.adminService.cloneRole(this.selectedRole.getName(), newRoleName).subscribe(
                    () => {
                        this.initRoles();
                    }
                );
            },
            () => { }
        );
    }

    private roleExists(roleName: string): boolean {
        for (let i = 0; i < this.roleList.length; i++) {
            if (this.roleList[i].getName() == roleName) {
                return true;
            }
        }
        return false;
    }

    private selectCapability(capability: string) {
        this.selectedCapability = capability;
    }

    addCapability() {
        this.openCapabilityEditorModal({ key: "ADMINISTRATION.ACTIONS.ADD_CAPABILITY" }, null).then(
            (capability: any) => {
                if (this.capabilityList.indexOf(capability) != -1) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.ALREADY_EXISTING_CAPABILITY" }, ModalType.warning);
                    return;
                }
                this.adminService.addCapabilityToRole(this.selectedRole.getName(), capability).subscribe(
                    () => {
                        this.selectedCapability = null;
                        this.initCapabilities();
                    }
                );
            },
            () => { }
        );
    }

    removeCapability() {
        this.adminService.removeCapabilityFromRole(this.selectedRole.getName(), this.selectedCapability).subscribe(
            () => {
                this.selectedCapability = null;
                this.initCapabilities();
            }
        );
    }

    editCapability() {
        this.openCapabilityEditorModal({ key: "ADMINISTRATION.ACTIONS.EDIT_CAPABILITY" }, this.selectedCapability).then(
            (capability: any) => {
                if (this.capabilityList.indexOf(capability) != -1) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.ALREADY_EXISTING_CAPABILITY" }, ModalType.warning).then();
                    return;
                }
                this.adminService.updateCapabilityForRole(this.selectedRole.getName(), this.selectedCapability, capability).subscribe(
                    () => {
                        this.selectedCapability = null;
                        this.initCapabilities();
                    }
                );
            },
            () => { }
        );
    }

    private openCapabilityEditorModal(title: Translation, capability: string) {
        const modalRef: NgbModalRef = this.modalService.open(CapabilityEditorModal, new ModalOptions());
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.capability = capability;
        return modalRef.result;
    }


}