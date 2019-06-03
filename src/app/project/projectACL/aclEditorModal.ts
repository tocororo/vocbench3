import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import {ProjectServices} from "../../services/projectServices";
import {BasicModalServices} from "../../widget/modal/basicModal/basicModalServices";
import {AccessLevel, LockLevel, Project} from '../../models/Project';

export class ACLEditorModalData extends BSModalContext {
    constructor(public acl: { name: string, consumers: { name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel }[], lock: any }) {
        super();
    }
}

@Component({
    selector: "acl-editor-modal",
    templateUrl: "./aclEditorModal.html",
})
export class ACLEditorModal implements ModalComponent<ACLEditorModalData> {
    context: ACLEditorModalData;

    private consumers: Consumer[];
    private lock: {availableLockLevel: LockLevel, lockingConsumer: string, acquiredLockLevel: LockLevel};

    private nullAccessLevel: AccessLevel = null;
    private accessLevels: AccessLevel[] = [AccessLevel.R, AccessLevel.RW];
    private lockLevels: LockLevel[] = [LockLevel.R, LockLevel.W, LockLevel.NO];

    private update: boolean = false; //useful to tells to the calling component if this modal has updated something

    private filterProject: string;

    constructor(public dialog: DialogRef<ACLEditorModalData>, private projectService: ProjectServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.consumers = this.context.acl.consumers;
        this.lock = this.context.acl.lock;
    }

    private onAccessLevelChange(consumer: Consumer, newLevel: AccessLevel) {
        var oldLevel: AccessLevel = consumer.availableACLLevel;

        var message: string;
        if (newLevel == this.nullAccessLevel) {
            message = "Are you sure to revoke Access Level of '" + this.context.acl.name + "' for the consumer '" + consumer.name + "'?";
        } else {
            message = "Are you sure to change Access Level of '" + this.context.acl.name + "' to '" + newLevel + 
                "' for the consumer '" + consumer.name + "'?";
        }
        this.basicModals.confirm("Update Access Level", message, "warning").then(
            confirm => {
                this.projectService.updateAccessLevel(new Project(this.context.acl.name), new Project(consumer.name), newLevel).subscribe(
                    stResp => {
                        consumer.availableACLLevel = newLevel;
                        this.update = true;
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
                this.projectService.updateLockLevel(new Project(this.context.acl.name), newLevel).subscribe(
                    stResp => {
                        this.lock.availableLockLevel = newLevel;
                        this.update = true;
                    }
                )
            },
            reject => { 
                this.lock.availableLockLevel = oldLevel;
            }
        );
    }

    private showConsumer(consumer: Consumer): boolean {
        return this.filterProject == null || consumer.name.toLocaleUpperCase().indexOf(this.filterProject.toLocaleUpperCase()) != -1;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.update);
    }

}

class Consumer {
    name: string;
    availableACLLevel: AccessLevel;
    acquiredACLLevel: AccessLevel;
}