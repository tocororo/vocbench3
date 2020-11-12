import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { ModalType } from 'src/app/widget/modal/Modals';
import { AccessLevel, AccessStatus, ConsumerACL, LockLevel, Project } from '../../models/Project';
import { ProjectServices } from "../../services/projectServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "acl-editor-modal",
    templateUrl: "./aclEditorModal.html",
})
export class ACLEditorModal {
    @Input() project: Project;

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    consumers: ConsumerACL[];
    lock: {availableLockLevel: LockLevel, lockingConsumer: string, acquiredLockLevel: LockLevel};

    private nullAccessLevel: AccessLevel = null;
    private accessLevels: AccessLevel[] = [AccessLevel.R, AccessLevel.RW];
    private lockLevels: LockLevel[] = [LockLevel.R, LockLevel.W, LockLevel.NO];

    filterProject: string;

    private update: boolean = false;

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices, private basicModals: BasicModalServices) {}

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.projectService.getAccessStatus(this.project.getName()).subscribe(
            (projACL: AccessStatus) => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.consumers = projACL.consumers;
                this.lock = projACL.lock;
            }
        )
    }

    private onAccessLevelChange(consumer: ConsumerACL, newLevel: AccessLevel) {
        var oldLevel: AccessLevel = consumer.availableACLLevel;

        var message: string;
        if (newLevel == this.nullAccessLevel) {
            message = "Are you sure to revoke Access Level of '" + this.project.getName() + "' for the consumer '" + consumer.name + "'?";
        } else {
            message = "Are you sure to change Access Level of '" + this.project.getName() + "' to '" + newLevel + 
                "' for the consumer '" + consumer.name + "'?";
        }
        this.basicModals.confirm("Update Access Level", message, ModalType.warning).then(
            confirm => {
                let updateFn: Observable<void>;
                if (VBContext.getLoggedUser().isAdmin()) {
                    updateFn = this.projectService.updateProjectAccessLevel(this.project, new Project(consumer.name), newLevel);
                } else {
                    updateFn = this.projectService.updateAccessLevel(new Project(consumer.name), newLevel);
                }
                updateFn.subscribe(
                    () => {
                        consumer.availableACLLevel = newLevel;
                        this.update = true;
                    }
                );
            },
            reject => {
                consumer.availableACLLevel = oldLevel;
            }
        );
    }

    private onLockLevelChange(newLevel: LockLevel) {
        var oldLevel: LockLevel = this.lock.availableLockLevel;
        let message: string = "Are you sure to change project lock to '" + newLevel + "'?";
        this.basicModals.confirm("Update Lock Level", message, ModalType.warning).then(
            confirm => {
                let updateFn: Observable<void>;
                if (VBContext.getLoggedUser().isAdmin()) {
                    this.projectService.updateProjectLockLevel(this.project, newLevel);
                } else {
                    this.projectService.updateLockLevel(newLevel);
                }
                updateFn.subscribe(
                    () => {
                        this.lock.availableLockLevel = newLevel;
                        this.update = true;
                    }
                );
            },
            reject => { 
                this.lock.availableLockLevel = oldLevel;
            }
        );
    }

    private showConsumer(consumer: ConsumerACL): boolean {
        return this.filterProject == null || consumer.name.toLocaleUpperCase().indexOf(this.filterProject.toLocaleUpperCase()) != -1;
    }
    
    ok() {
        this.activeModal.close(this.update);
    }

}
