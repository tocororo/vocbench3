import { Component } from "@angular/core";
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ACLEditorModal, ACLEditorModalData } from "./aclEditorModal";
import { ProjectServices } from "../../services/projectServices";
import { AccessLevel, LockLevel } from '../../models/Project';

@Component({
    selector: "project-acl-modal",
    templateUrl: "./projectACLModal.html",
    styles: [`
        .firstCol { min-width: 90px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fixedCol { width: 60px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fixedColInner { width: 30px; height: 22px; }
        .disabledCell { background-color: #eee;}
        .accessed { background-color: #58fa58;}
        .locked { background-color: #fa5858;}
    `]
})
export class ProjectACLModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private statusMap: { name: string, consumers: { name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel }[], lock: any }[];
    private consumerList: string[];

    private tableModel: { project: string, consumerACLs: ACLMapping[] }[];

    constructor(public dialog: DialogRef<BSModalContext>, private modal: Modal, private projectService: ProjectServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.init();
    }

    private init() {
        this.projectService.getAccessStatusMap().subscribe(
            statusMap => {
                this.statusMap = statusMap;
                this.tableModel = [];
                let projectList: string[] = [];
                for (var i = 0; i < statusMap.length; i++) {
                    projectList.push(statusMap[i].name);
                }
                this.consumerList = projectList.slice();
                this.consumerList.unshift("SYSTEM");

                for (var i = 0; i < projectList.length; i++) {
                    let projectName: string = projectList[i];
                    let projectLock = this.getProjectLock(projectName);
                    let aclMappings: ACLMapping[] = [];
                    for (var j = 0; j < this.consumerList.length; j++) {
                        let projectMapping = this.getAccessControlMapping(projectList[i], this.consumerList[j]);
                        let mapping: ACLMapping = {
                            consumer: this.consumerList[j],
                            availableAccessLevel: projectMapping.availableACLLevel,
                            acquiredAccessLevel: projectMapping.acquiredACLLevel,
                        }
                        if (projectName != this.consumerList[j]) { //add lock information only if the consumer is != project
                            mapping.availableLockLevel = projectLock.availableLockLevel;
                            if (projectLock.lockingConsumer == this.consumerList[j]) {
                                mapping.acquiredLockLevel = projectLock.acquiredLockLevel;
                            }
                        }
                        aclMappings.push(mapping);

                    }
                    this.tableModel.push({ project: projectName, consumerACLs: aclMappings });
                }
            }
        );
    }

    private getAccessControlMapping(project: string, consumer: string): { name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel } {
        for (var i = 0; i < this.statusMap.length; i++) {
            if (this.statusMap[i].name == project) {
                let consumers: { name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel }[] = this.statusMap[i].consumers;
                for (var j = 0; j < consumers.length; j++) {
                    if (consumers[j].name == consumer) {
                        return consumers[j];
                    }
                }
            }
        }
        return { name: null, availableACLLevel: null, acquiredACLLevel: null };
    }

    private getProjectLock(project: string): { availableLockLevel: LockLevel, lockingConsumer: string, acquiredLockLevel: LockLevel } {
        for (var i = 0; i < this.statusMap.length; i++) {
            if (this.statusMap[i].name == project) {
                return this.statusMap[i].lock;
            }
        }
        return null;
    }

    /**
     * Returns the style class to apply to a cell of the table
     * @param project
     * @param consumer 
     * @param accessLevel if true the style is computed in order to be applied to the acquired access level cell
     * @param locked if true the style is computed in order to be applied to the locked cell
     */
    private getCellClass(project: string, consumer: string, accessLevel?: boolean, locked?: boolean) {
        var cls = "text-center fixedColInner";
        if (project == consumer) {
            cls += " disabledCell";
        } else {
            if (accessLevel && this.getAccessControlMapping(project, consumer).acquiredACLLevel != null) {
                cls += " accessed";
            }
            if (locked && this.getProjectLock(project).lockingConsumer == consumer) {
                cls += " locked";
            }
        }
        return cls;
    }

    private getTitleAvailableAccessLevel(project: string, consumer: string, availableAccessLevel: AccessLevel) {
        switch (availableAccessLevel) {
            case AccessLevel.R:
                return "Available Access Level: Project '" + project + "' grants Read access to '" + consumer + "' project";
            case AccessLevel.RW:
                return "Available Access Level: Project '" + project + "' grants Read and Write access to '" + consumer + "' project";
            default:
                return "Available Access Level";
        }
    }

    private getTitleAcquiredAccessLevel(project: string, consumer: string, acquiredAccessLevel: AccessLevel) {
        switch (acquiredAccessLevel) {
            case AccessLevel.R:
                return "Acquired Access Level: Project '" + project + "' is accessed by '" + consumer + "' in Read level";
            case AccessLevel.RW:
                return "Acquired Access Level: Project '" + project + "' is accessed by '" + consumer + "' in Read and Write level";
            default:
                return "Acquired Access Level";
        }
    }

    private getTitleAvailableLock(project: string, availableLockLevel: LockLevel) {
        switch (availableLockLevel) {
            case LockLevel.NO:
                return "Available Lock Level: Project '" + project + "' cannot be locked by any consumer";
            case LockLevel.W:
                return "Available Lock Level: Project '" + project + "' can be locked to prevent writing operations by other consumers";
            case LockLevel.R:
                return "Available Lock Level: Project '" + project + "' can be locked to prevent access by other consumers";
            default:
                return "Available Lock Level";
        }
    }

    private getTitleAcquiredLock(project: string, consumer: string, availableLockLevel: LockLevel) {
        switch (availableLockLevel) {
            case LockLevel.R:
                return "Acquired Lock Level: Project '" + project + "'  is locked by '" + consumer + "' in Read level";
            case LockLevel.W:
                return "Acquired Lock Level: Project '" + project + "'  is locked by '" + consumer + "' in Write level";
            default:
                return "Acquired Lock Level";
        }
    }

    private editProjectACL(project: string) {
        var acl: { name: string, consumers: { name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel }[], lock: any };
        for (var i = 0; i < this.statusMap.length; i++) {
            if (this.statusMap[i].name == project) {
                acl = this.statusMap[i];
                break;
            }
        }

        var modalData = new ACLEditorModalData(acl);
        const builder = new BSModalContextBuilder<ACLEditorModalData>(
            modalData, undefined, ACLEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('sm').keyboard(27).toJSON() };
        return this.modal.open(ACLEditorModal, overlayConfig).result.then(
            (update: any) => {
                if (update) {
                    this.init();
                }
            }
        );
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}

class ACLMapping {
    public consumer: string;
    public availableAccessLevel: AccessLevel;
    public acquiredAccessLevel: AccessLevel;
    public availableLockLevel?: LockLevel;
    public acquiredLockLevel?: LockLevel;
}