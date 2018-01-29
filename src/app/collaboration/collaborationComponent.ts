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

@Component({
    selector: 'collaboration-component',
    templateUrl: './collaborationComponent.html',
    host: { class: "pageComponent" }
})
export class CollaborationComponent {

    private settingsConfigured: boolean; //serverURL
    private preferencesConfigured: boolean; //credentials
    private csProjectLinked: boolean;

    private issues: any[] = []; //TODO

    constructor(private collaborationService: CollaborationServices, private basicModals: BasicModalServices,
        private sharedModals: SharedModalServices, private modal: Modal) {}

    ngOnInit() {
        this.csProjectLinked = VBContext.getCollaborationCtx().isLinked();
        this.initIssueList();
    }

    private initIssueList() {
        let collCtx: CollaborationCtx = VBContext.getCollaborationCtx();

        //TODO maybe here it is appropriate to chech the status, since if the project is not linked, the request listIssue is invoked anyway
        //(just in case when the project was linked at project accessed)
        
        let initPrefs = this.collaborationService.getProjectPreferences(CollaborationCtx.jiraFactoryId).map(
            prefs => {
                collCtx.setPreferences(prefs);
            }
        );
        let initSettings = this.collaborationService.getProjectSettings(CollaborationCtx.jiraFactoryId).map(
            settings => {
                collCtx.setSettings(settings);
            }
        );

        Observable.forkJoin([initPrefs, initSettings]).subscribe(
            resp => {
                this.preferencesConfigured = collCtx.isPreferencesConfigured();
                this.settingsConfigured = collCtx.isSettingsConfigured();
        
                if (collCtx.isEnabled() && collCtx.isLinked() && this.preferencesConfigured && this.settingsConfigured) {
                    this.collaborationService.listIssues().subscribe(
                        issues => {
                            this.issues = issues;
                        },
                        (err: Error) => {
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

        // this.preferencesConfigured = collCtx.isPreferencesConfigured();
        // this.settingsConfigured = collCtx.isSettingsConfigured();

        // if (collCtx.isEnabled() && this.preferencesConfigured && this.settingsConfigured) {
        //     this.collaborationService.listIssues().subscribe(
        //         issues => {
        //             console.log(issues);
        //         },
        //         (err: Error) => {
        //             if (err.name.endsWith("ConnectException")) {
        //                 this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
        //                     "Connection to Collaboration System server failed." , "error", err.name + " " + err.message);
        //                 collCtx.setWorking(false);
        //             }
        //         }
        //     )
        // }

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

    private createProject() {
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