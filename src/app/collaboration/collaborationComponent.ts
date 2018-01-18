import { Component, HostListener } from '@angular/core';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { CollaborationConfigModal } from "./collaborationConfigModal";
import { CollaborationProjectModal } from "./collaborationProjectModal";
import { CollaborationServices } from "../services/collaborationServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { Plugin } from '../models/Plugins';

@Component({
    selector: 'collaboration-component',
    templateUrl: './collaborationComponent.html',
    host: { class: "pageComponent" }
})
export class CollaborationComponent {

    private jiraPlugin: Plugin = new Plugin("it.uniroma2.art.semanticturkey.plugin.impls.collaboration.JiraBackendFactory");

    private settingsConfigured: boolean = true; //serverURL
    private preferencesConfigured: boolean = true; //credentials
    private csProjectLinked: boolean = false;

    constructor(private collaborationService: CollaborationServices, private sharedModals: SharedModalServices, private modal: Modal) {}

    ngOnInit() {
        this.doPreCheck();
    }

    private doPreCheck() {
        /**
         * Perform 2 checks:
         * - server url configured?
         * - user credentials setted?
         * If both yes => try to get issueList
         *      if fails => distinguish wrong settings (serverURL) or wrong preferences (credentials)
         */
        this.checkSettings().subscribe(
            res => {
                if (this.settingsConfigured) {
                    this.checkPreferences().subscribe(
                        res => {
                            if (this.preferencesConfigured) {
                                alert("listing issues");
                            }
                        }
                    )
                }
            }
        )
    }

    private checkSettings() {
        return this.collaborationService.getProjectSettings(this.jiraPlugin.factoryID).map(
            settings => {
                this.settingsConfigured = !settings.requireConfiguration();
            }
        );
    }

    private checkPreferences() {
        return this.collaborationService.getProjectPreferences(this.jiraPlugin.factoryID).map(
            prefs => {
                this.preferencesConfigured = !prefs.requireConfiguration();
            }
        );
    }


    private openConfig() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(CollaborationConfigModal, overlayConfig).result.then(
            res => {
                this.doPreCheck();
            }
        );
    }

    private createProject() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(CollaborationProjectModal, overlayConfig);
    }

}