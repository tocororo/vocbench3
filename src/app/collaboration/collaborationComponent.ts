import { Component, ElementRef, ViewChild } from '@angular/core';
import { CollaborationServices } from "../services/collaborationServices";
import { ResourcesServices } from '../services/resourcesServices';
import { AuthorizationEvaluator } from '../utils/AuthorizationEvaluator';
import { VBActionsEnum } from '../utils/VBActions';
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBEventHandler } from '../utils/VBEventHandler';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { CollaborationModalServices } from './collaborationModalService';
import { IssueListComponent } from './issueListComponent';

@Component({
    selector: 'collaboration-component',
    templateUrl: './collaborationComponent.html',
    host: { class: "pageComponent" }
})
export class CollaborationComponent {

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;
    @ViewChild(IssueListComponent) viewChildList: IssueListComponent;
    
    private eventSubscriptions: any[] = [];

    //TODO configuration only available to sys admin or users with privileges

    private projSettingsConfigured: boolean; //serverURL
    private userSettingsConfigured: boolean; //credentials
    private csProjectLinked: boolean;

    private csWorking: boolean;

    constructor(private collaborationService: CollaborationServices, private resourceService: ResourcesServices, private vbCollaboration: VBCollaboration, 
        private collModals: CollaborationModalServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices,
        private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.collaborationSystemStatusChanged.subscribe(
            () => this.onCollaborationSystemStatusChange()
        ));
    }

    ngOnInit() {
        this.initIssueList();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    private initIssueList() {
        /**
         * Gets the status of the CS, so checks if settings and preferences are configured, if a project is linked,
         * then retrieves the issues list.
         */
        this.vbCollaboration.initCollaborationSystem().subscribe(
            resp => {
                this.csProjectLinked = this.vbCollaboration.isLinked();
                this.projSettingsConfigured = this.vbCollaboration.isProjSettingsConfigured();
                this.userSettingsConfigured = this.vbCollaboration.isUserSettingsConfigured();

                if (this.userSettingsConfigured && this.projSettingsConfigured && this.csProjectLinked && this.vbCollaboration.isEnabled()) {
                    //if system was already working simply try to refresh the issue list
                    if (this.csWorking) {
                        this.viewChildList.refresh();
                    } else { 
                        //otherwise update csWorking (conseguentially the issue-list updates itself since csWorking turns to true, it is rendered and initialized again)
                        this.csWorking = true;
                        /**
                         * Do not update the working status in vbCollaboration, it will be updated by IssueListComponent
                         * if the issues retrieving goes ok. Otherwise the collaborationSystemStatusChanged would be catched by the 
                         * CS handlers in the open ResourceViews and they will execute other requests, in addition to listIssues()
                         * in IssueListComponent, that would fail as well as listIssues and it will show multiple error dialog.
                         */
                    }
                }
            }
        );
    }

    private openProjectConfig() {
        this.collModals.editCollaborationProjectSettings().then(
            res => {
                this.initIssueList();
            },
            () => {}
        )
    }

    private openUserConfig() {
        this.collModals.editCollaborationUserSettings().then(
            res => {
                this.initIssueList();
            },
            () => {}
        );
    }

    private assignProject() {
        this.collModals.editCollaborationProject().then(
            res => {
                this.initIssueList();
            },
            () => {}
        );
    }

    private isCollProjManagementAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.collaboration);
    }

    private onCollaborationSystemStatusChange() {
        this.csWorking = this.vbCollaboration.isWorking();
    }

}