import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig } from 'ngx-modialog';
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { AccessLevel, LockLevel, AccessStatus, ConsumerACL, LockStatus, Project } from '../../models/Project';
import { ProjectServices } from "../../services/projectServices";
import { UIUtils } from "../../utils/UIUtils";
import { ACLEditorModal, ACLEditorModalData } from "./aclEditorModal";

@Component({
    selector: "project-acl-modal",
    templateUrl: "./projectACLModal.html",
    styles: [`
        .firstCol { min-width: 90px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fixedCol { max-width: 60px; width: 60px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fixedColInner { min-width: 30px; width: 30px; min-height: 22px; height: 22px; }
        .disabledCell { background-color: #eee;}
        .accessed { background-color: #58fa58;}
        .locked { background-color: #fa5858;}
    `]
})
export class ProjectACLModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private statusMap: AccessStatus[];
    private consumerList: string[];

    private tableModel: { project: string, consumerACLs: ACLMapping[] }[];

    constructor(public dialog: DialogRef<BSModalContext>, private modal: Modal, private projectService: ProjectServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.init();
    }

    private init() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.projectService.getAccessStatusMap().subscribe(
            statusMap => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
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

                this.tableModel.forEach(tableEntry => {
                    this.initClassAndTitle(tableEntry);
                });
            }
        );
    }

    private getAccessControlMapping(project: string, consumer: string): ConsumerACL {
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

    private getProjectLock(project: string): LockStatus {
        for (var i = 0; i < this.statusMap.length; i++) {
            if (this.statusMap[i].name == project) {
                return this.statusMap[i].lock;
            }
        }
        return null;
    }

    private initClassAndTitle(tableEntry: { project: string, consumerACLs: ACLMapping[] }) {
        tableEntry.consumerACLs.forEach(consumerAcl => {
            consumerAcl['availableAccessLevel_title'] = this.initTitleAvailableAccessLevel(tableEntry.project, consumerAcl.consumer, consumerAcl.availableAccessLevel);
            consumerAcl['acquiredAccessLevel_title'] = this.initTitleAcquiredAccessLevel(tableEntry.project, consumerAcl.consumer, consumerAcl.acquiredAccessLevel);
            consumerAcl['availableLockLevel_title'] = this.initTitleAvailableLock(tableEntry.project, consumerAcl.availableLockLevel);
            consumerAcl['acquiredLockLevel_title'] = this.initTitleAcquiredLock(tableEntry.project, consumerAcl.consumer, consumerAcl.acquiredLockLevel);
            consumerAcl['availableAccessLevel_class'] = this.initCellClass(tableEntry.project, consumerAcl.consumer);
            consumerAcl['acquiredAccessLevel_class'] = this.initCellClass(tableEntry.project, consumerAcl.consumer, true);
            consumerAcl['availableLockLevel_class'] = this.initCellClass(tableEntry.project, consumerAcl.consumer);
            consumerAcl['acquiredLockLevel_class'] = this.initCellClass(tableEntry.project, consumerAcl.consumer, false, true);
        })
        
    }

    /**
     * Returns the style class to apply to a cell of the table
     * @param project
     * @param consumer 
     * @param accessLevel if true the style is computed in order to be applied to the acquired access level cell
     * @param locked if true the style is computed in order to be applied to the locked cell
     */
    private initCellClass(project: string, consumer: string, accessLevel?: boolean, locked?: boolean) {
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

    private initTitleAvailableAccessLevel(project: string, consumer: string, availableAccessLevel: AccessLevel) {
        switch (availableAccessLevel) {
            case AccessLevel.R:
                return "Available Access Level: Project '" + project + "' grants Read access to '" + consumer + "' project";
            case AccessLevel.RW:
                return "Available Access Level: Project '" + project + "' grants Read and Write access to '" + consumer + "' project";
            default:
                return "Available Access Level";
        }
    }

    private initTitleAcquiredAccessLevel(project: string, consumer: string, acquiredAccessLevel: AccessLevel) {
        switch (acquiredAccessLevel) {
            case AccessLevel.R:
                return "Acquired Access Level: Project '" + project + "' is accessed by '" + consumer + "' in Read level";
            case AccessLevel.RW:
                return "Acquired Access Level: Project '" + project + "' is accessed by '" + consumer + "' in Read and Write level";
            default:
                return "Acquired Access Level";
        }
    }

    private initTitleAvailableLock(project: string, availableLockLevel: LockLevel) {
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

    private initTitleAcquiredLock(project: string, consumer: string, availableLockLevel: LockLevel) {
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
        var modalData = new ACLEditorModalData(new Project(project));
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