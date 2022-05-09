import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { AccessLevel, AccessStatus, ConsumerACL, LockLevel, LockStatus, Project } from '../../models/Project';
import { ProjectServices } from "../../services/projectServices";
import { UIUtils } from "../../utils/UIUtils";
import { ACLEditorModal } from "./aclEditorModal";

@Component({
    selector: "project-acl-modal",
    templateUrl: "./projectACLModal.html",
    styleUrls: ["./projectACL.css"]
})
export class ProjectACLModal {

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    private statusMap: AccessStatus[];
    consumerList: string[];

    aclTable: AclTableRow[];

    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private projectService: ProjectServices) {}

    ngOnInit() {
        this.init();
    }

    private init() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.projectService.getAccessStatusMap().subscribe(
            statusMap => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.statusMap = statusMap;
                this.aclTable = [];
                //consumer list (that will compose the header row) is composed by SYSTEM + all the projects 
                this.consumerList = this.statusMap.map(entry => entry.name);
                this.consumerList.unshift("SYSTEM");

                this.statusMap.forEach((projectAcl: AccessStatus) => {
                    let project: string = projectAcl.name;
                    let row: AclTableRow = {
                        project: project,
                        lock: {
                            status: projectAcl.lock,
                            title: this.getLockLevelTitle(project, projectAcl.lock),
                            class: "lock-badge " + (projectAcl.lock.lockingConsumer != null ? "lock-active" : "lock-default")
                        },
                        cols: []
                    };
                    this.consumerList.forEach(consumer => {
                        let acl: ConsumerACL = this.findProjectConsumerACL(project, consumer);
                        let col: AclTableCol = {
                            consumer: consumer,
                            accessLevelCell: {
                                available: acl ? acl.availableACLLevel : null,
                                acquired: acl ? acl.acquiredACLLevel : null,
                                title: this.getAccessLevelTitle(project, consumer, acl, projectAcl.lock),
                                class: this.getAccessLevelClass(project, consumer, acl, projectAcl.lock)
                            },
                        };
                        row.cols.push(col);
                    });
                    this.aclTable.push(row);
                });
            }
        );
    }

    /**
     * Return the ACL for the given project-consumer pair
     * @param project 
     * @param consumer 
     */
    private findProjectConsumerACL(project: string, consumer: string): ConsumerACL {
        if (project == consumer) {
            return null; //a project has no ACL for itself
        }
        let aclOfProject: AccessStatus = this.statusMap.find(entry => entry.name == project);
        return aclOfProject.consumers.find(consumerAcl => consumerAcl.name == consumer);
    }

    /**
     * Returns the title (to show on access level cell hovering) for the given project-consumer pair.
     * @param project 
     * @param consumer 
     * @param acl 
     */
    private getAccessLevelTitle(project: string, consumer: string, acl: ConsumerACL, lock: LockStatus): string {
        let title: string = "";
        if (project != consumer) { //title shown only if project and consumer are different (disabled cell otherwise)
            //available
            title += "Available Access Level: Project '" + project + "'";
            if (acl.availableACLLevel == AccessLevel.RW) {
                title += " grants Read and Write";
            } else if (acl.availableACLLevel == AccessLevel.R) {
                title += " grants Read";
            } else {
                title += " doesn't grant any";
            }
            title += " access to '" + consumer + "'";
            //acquired
            if (acl.acquiredACLLevel != null) {
                title += "\nAcquired Access Level: Project '" + project + "' is accessed by '" + consumer + "'";
                if (acl.acquiredACLLevel == AccessLevel.RW) {
                    title += " in Read and Write level";
                } else if (acl.availableACLLevel == AccessLevel.R) {
                    title += " in Read level";
                }
            }
            
            //lock
            if (lock.lockingConsumer == consumer) {
                title += "\nAquired Lock Level: Project '" + project + "' is locked by '" + consumer + "'";
                if (lock.acquiredLockLevel == LockLevel.R) {
                    title += " in Read level";
                } else if (lock.acquiredLockLevel == LockLevel.W) {
                    title += " in Write level";
                }
            }
        }
        return title;
    }
    private getAccessLevelClass(project: string, consumer: string, acl: ConsumerACL, lock: LockStatus): string {
        let cls = "text-center fixedColInner";
        if (project == consumer) {
            cls += " disabledCell";
        } else {
            if (acl.acquiredACLLevel != null) {
                cls += " accessed";
            }
            if (lock.lockingConsumer == consumer) {
                cls += " locked";
            }
        }
        return cls;
    }

    /**
     * Returns the title (to show on the lock level cell hovering) for the given project-consumer pair.
     * @param project 
     * @param consumer 
     * @param lockStatus 
     */
    private getLockLevelTitle(project: string, lockStatus: LockStatus) {
        let title: string = "";
        //available
        title = "Available Lock Level: Project '" + project + "'";
        if (lockStatus.availableLockLevel == LockLevel.NO) {
            title += " cannot be locked by any consumer";
        } else if (lockStatus.availableLockLevel == LockLevel.W) {
            title += " can be locked to prevent writing operations by other consumers";
        } else if (lockStatus.availableLockLevel == LockLevel.R) {
            title += " can be locked to prevent access by other consumers";
        }
        //acquired
        if (lockStatus.lockingConsumer != null) { //details about acquired level are shown only if project is locked
            title += "\nAcquired Lock Level: Project '" + project + "' is locked by '" + lockStatus.lockingConsumer + "'";
            if (lockStatus.acquiredLockLevel == LockLevel.W) {
                title += " in Write level";
            } else if (lockStatus.acquiredLockLevel == LockLevel.R) {
                title += " in Read level";
            }
        }
        return title;
    }

    private editProjectACL(project: string) {
        const modalRef: NgbModalRef = this.modalService.open(ACLEditorModal, new ModalOptions('sm'));
        modalRef.componentInstance.project = new Project(project);
        modalRef.result.then(
            (update: boolean) => {
                if (update) {
                    this.init();
                }
            }
        );
    }

    ok() {
        this.activeModal.close();
    }

}

class AclTableRow {
    project: string;
    lock: LockCell;
    cols: AclTableCol[];
}
class LockCell {
    status: LockStatus;
    title: string;
    class: string;
}
class AclTableCol {
    consumer: string;
    accessLevelCell: AccessLevelCell;
}
class AccessLevelCell {
    available: AccessLevel;
    acquired: AccessLevel;
    title: string;
    class: string;
}