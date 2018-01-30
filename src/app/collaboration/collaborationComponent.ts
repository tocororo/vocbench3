import { Component, HostListener } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { CollaborationConfigModal } from "./collaborationConfigModal";
import { CollaborationProjectModal } from "./collaborationProjectModal";
import { CollaborationServices } from "../services/collaborationServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { Plugin, PluginConfiguration } from '../models/Plugins';
import { CollaborationCtx } from '../models/Collaboration';
import { VBContext } from '../utils/VBContext';
import { UIUtils } from '../utils/UIUtils';

@Component({
    selector: 'collaboration-component',
    templateUrl: './collaborationComponent.html',
    host: { class: "pageComponent" }
})
export class CollaborationComponent {

    //TODO configuration only available to sys admin or users with privileges

    private settingsConfigured: boolean; //serverURL
    private preferencesConfigured: boolean; //credentials
    private csProjectLinked: boolean;

    private issues: any[]; //TODO

    constructor(private collaborationService: CollaborationServices, private basicModals: BasicModalServices,
        private sharedModals: SharedModalServices, private modal: Modal) {}

    ngOnInit() {
        this.initIssueList();
    }

    private initIssueList() {

        /**
         * Gets the status of the CS, so checks if settings and preferences are configured, if a project is linked,
         * then retrieves the issues list.
         */
        this.collaborationService.getCollaborationSystemStatus(CollaborationCtx.jiraFactoryId).subscribe(
            resp => {
                let collCtx: CollaborationCtx = VBContext.getCollaborationCtx();
             
                this.csProjectLinked = collCtx.isLinked();
                this.settingsConfigured = collCtx.isSettingsConfigured();
                this.preferencesConfigured = collCtx.isPreferencesConfigured();

                if (this.preferencesConfigured && this.settingsConfigured && this.csProjectLinked && collCtx.isEnabled()) {
                    collCtx.setWorking(true);
                    UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                    this.collaborationService.listIssues().subscribe(
                        issues => {
                            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                            this.issues = issues;
                        },
                        (err: Error) => {
                            //in case listIssues throws a ConnectException set the "working" flag to false
                            if (err.name.endsWith("ConnectException")) {
                                this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
                                    "Connection to Collaboration System server failed." , "error", err.name + " " + err.message);
                                collCtx.setWorking(false);
                            }
                        }
                    )
                }

            }
        );

    }

    private openConfig() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(CollaborationConfigModal, overlayConfig).result.then(
            res => {
                this.initIssueList();
            },
            () => {}
        );
    }

    private assignProject() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(CollaborationProjectModal, overlayConfig).result.then(
            res => {
                this.initIssueList();
            },
            () => {}
        );
    }

}