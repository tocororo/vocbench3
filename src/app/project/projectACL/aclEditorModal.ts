import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { ModalType, Translation } from 'src/app/widget/modal/Modals';
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
    private universalACLLevel: AccessLevel;

    filterProject: string;

    private update: boolean = false;

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices, private basicModals: BasicModalServices) {}

    ngOnInit() {
        this.initAccessStatus();
    }

    initAccessStatus() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.projectService.getAccessStatus(this.project.getName()).subscribe(
            (projACL: AccessStatus) => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.consumers = projACL.consumers;
                this.lock = projACL.lock;
                this.universalACLLevel = projACL.universalACLLevel;
            }
        )
    }

    private onAccessLevelChange(consumer: ConsumerACL, newLevel: AccessLevel) {
        let oldLevel: AccessLevel = consumer.availableACLLevel;
        let message: Translation;
        if (newLevel == this.nullAccessLevel) {
            message = {key:"MESSAGES.ACL_REVOKE_ACCESS_CONFIRM", params:{project: this.project.getName(), consumer: consumer.name}};
        } else {
            message = {key:"MESSAGES.ACL_CHANGE_ACCESS_CONFIRM", params:{project: this.project.getName(), level: newLevel, consumer: consumer.name}};
        }
        this.basicModals.confirm({key:"PROJECTS.ACTIONS.UPDATE_ACCESS_LEVEL"}, message, ModalType.warning).then(
            () => {
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
                        this.initAccessStatus();
                    }
                );
            },
            () => { //reject
                consumer.availableACLLevel = oldLevel;
            }
        );
    }

    onUniversalAccessLevelChange(newLevel: AccessLevel) {
        let oldLevel: AccessLevel = this.universalACLLevel;
        let message: Translation;
        if (newLevel == this.nullAccessLevel) {
            message = {key:"MESSAGES.ACL_REVOKE_UNIVERSAL_ACCESS_CONFIRM", params:{project: this.project.getName()}};
        } else {
            message = {key:"MESSAGES.ACL_CHANGE_UNIVERSAL_ACCESS_CONFIRM", params:{project: this.project.getName(), level: newLevel}};
        }
        this.basicModals.confirm({key:"PROJECTS.ACTIONS.UPDATE_ACCESS_LEVEL"}, message, ModalType.warning).then(
            () => { //confirmed
                let updateFn: Observable<void>;
                if (VBContext.getLoggedUser().isAdmin()) {
                    updateFn = this.projectService.updateUniversalProjectAccessLevel(this.project, newLevel);
                } else {
                    updateFn = this.projectService.updateUniversalAccessLevel(newLevel);
                }
                updateFn.subscribe(
                    () => {
                        this.update = true;
                        this.initAccessStatus();
                    }
                );
            },
            () => { //rejected
                this.universalACLLevel = oldLevel;
            }
        );
    }

    private onLockLevelChange(newLevel: LockLevel) {
        var oldLevel: LockLevel = this.lock.availableLockLevel;
        this.basicModals.confirm({key:"PROJECTS.ACTIONS.UPDATE_LOCK_LEVEL"}, {key:"MESSAGES.ACL_CHANGE_LOCK_CONFIRM", params:{level: newLevel}}, ModalType.warning).then(
            () => {
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
                        this.initAccessStatus();
                    }
                );
            },
            () => { //reject
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
