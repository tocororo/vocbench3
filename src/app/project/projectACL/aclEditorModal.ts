import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ProjectServices} from "../../services/projectServices";
import {ModalServices} from "../../widget/modal/basicModal/modalServices";
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

    private consumers: { name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel }[];
    private lock: {availableLockLevel: LockLevel, lockingConsumer: string, acquiredLockLevel: LockLevel};

    private accessLevels: AccessLevel[] = [AccessLevel.R, AccessLevel.RW];
    private lockLevels: LockLevel[] = [LockLevel.R, LockLevel.W, LockLevel.NO];

    private update: boolean = false; //useful to tells to the calling component if this modal has updated something

    constructor(public dialog: DialogRef<ACLEditorModalData>, private projectService: ProjectServices, private modalService: ModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.consumers = this.context.acl.consumers;
        this.lock = this.context.acl.lock;
    }

    private onAccessLevelChange(consumer: { name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel }, newLevel: AccessLevel) {
        var oldLevel: AccessLevel = consumer.availableACLLevel;
        console.log("oldLevel", oldLevel);
        console.log("newLevel", newLevel);
        this.modalService.confirm("Update Access Level", "Are you sure to change Access Level of '" 
            + this.context.acl.name + "' to '" + newLevel + "' for the consumer '" + consumer.name + "'?", "warning").then(
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
        this.modalService.confirm("Update Lock Level", "Are you sure to change project lock to '" + newLevel + "'?", "warning").then(
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
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.update);
    }

}