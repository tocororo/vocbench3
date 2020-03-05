import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { AccessLevel, AccessStatus, ConsumerACL, LockLevel, Project } from '../../models/Project';
import { ProjectServices } from "../../services/projectServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class ACLEditorModalData extends BSModalContext {
    constructor(public project: Project) {
        super();
    }
}

@Component({
    selector: "acl-editor-modal",
    templateUrl: "./aclEditorModal.html",
})
export class ACLEditorModal implements ModalComponent<ACLEditorModalData> {
    context: ACLEditorModalData;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private consumers: ConsumerACL[];
    private lock: {availableLockLevel: LockLevel, lockingConsumer: string, acquiredLockLevel: LockLevel};

    private nullAccessLevel: AccessLevel = null;
    private accessLevels: AccessLevel[] = [AccessLevel.R, AccessLevel.RW];
    private lockLevels: LockLevel[] = [LockLevel.R, LockLevel.W, LockLevel.NO];

    private filterProject: string;

    constructor(public dialog: DialogRef<ACLEditorModalData>, private projectService: ProjectServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.projectService.getAccessStatusMap().subscribe(
            (status: AccessStatus[]) => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                let projACL: AccessStatus = status.find(s => s.name == this.context.project.getName());
                this.consumers = projACL.consumers;
                this.lock = projACL.lock;
            }
        )
    }

    private onAccessLevelChange(consumer: ConsumerACL, newLevel: AccessLevel) {
        var oldLevel: AccessLevel = consumer.availableACLLevel;

        var message: string;
        if (newLevel == this.nullAccessLevel) {
            message = "Are you sure to revoke Access Level of '" + this.context.project.getName() + "' for the consumer '" + consumer.name + "'?";
        } else {
            message = "Are you sure to change Access Level of '" + this.context.project.getName() + "' to '" + newLevel + 
                "' for the consumer '" + consumer.name + "'?";
        }
        this.basicModals.confirm("Update Access Level", message, "warning").then(
            confirm => {
                this.projectService.updateAccessLevel(this.context.project, new Project(consumer.name), newLevel).subscribe(
                    stResp => {
                        consumer.availableACLLevel = newLevel;
                    }
                ) 
            },
            reject => {
                consumer.availableACLLevel = oldLevel;
            }
        );
    }

    private onLockLevelChange(newLevel: LockLevel) {
        var oldLevel: LockLevel = this.lock.availableLockLevel;
        let message: string = "Are you sure to change project lock to '" + newLevel + "'?";
        this.basicModals.confirm("Update Lock Level", message, "warning").then(
            confirm => {
                this.projectService.updateLockLevel(this.context.project, newLevel).subscribe(
                    stResp => {
                        this.lock.availableLockLevel = newLevel;
                    }
                )
            },
            reject => { 
                this.lock.availableLockLevel = oldLevel;
            }
        );
    }

    private showConsumer(consumer: ConsumerACL): boolean {
        return this.filterProject == null || consumer.name.toLocaleUpperCase().indexOf(this.filterProject.toLocaleUpperCase()) != -1;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}
