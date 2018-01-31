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
import { Issue } from '../models/Collaboration';
import { VBContext } from '../utils/VBContext';
import { UIUtils } from '../utils/UIUtils';
import { VBCollaboration } from '../utils/VBCollaboration';
import { ResourcesServices } from '../services/resourcesServices';
import { ARTURIResource, ResourceUtils } from '../models/ARTResources';

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

    private csWorking: boolean = true;

    private issues: Issue[];

    constructor(private collaborationService: CollaborationServices, private resourceService: ResourcesServices,
        private vbCollaboration: VBCollaboration, private basicModals: BasicModalServices, private sharedModals: SharedModalServices,
        private modal: Modal) {}

    ngOnInit() {
        this.initIssueList();
    }

    private initIssueList() {
        /**
         * Gets the status of the CS, so checks if settings and preferences are configured, if a project is linked,
         * then retrieves the issues list.
         */
        this.vbCollaboration.initCollaborationSystem().subscribe(
            resp => {
                this.csProjectLinked = this.vbCollaboration.isLinked();
                this.settingsConfigured = this.vbCollaboration.isSettingsConfigured();
                this.preferencesConfigured = this.vbCollaboration.isPreferencesConfigured();

                if (this.preferencesConfigured && this.settingsConfigured && this.csProjectLinked && this.vbCollaboration.isEnabled()) {
                    this.vbCollaboration.setWorking(true);
                    this.issues = null;
                    UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                    this.collaborationService.listIssues().subscribe(
                        issues => {
                            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                            this.issues = issues;
                            this.enrichIssuesWithResources();
                        },
                        (err: Error) => {
                            //in case listIssues throws a ConnectException set the "working" flag to false
                            if (err.name.endsWith("ConnectException")) {
                                this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
                                    "Connection to Collaboration System server failed." , "error", err.name + " " + err.message);
                            }
                            this.vbCollaboration.setWorking(false);
                            this.csWorking = false;
                        }
                    )
                }
            }
        );
    }

    private enrichIssuesWithResources() {
        let resources: ARTURIResource[] = [];
        this.issues.forEach((issue: Issue) => {
            let labels: string[] = issue.getLabels();
            labels.forEach((label: string) => {
                let res: ARTURIResource = new ARTURIResource(label);
                if (!ResourceUtils.containsNode(resources, res)) {
                    resources.push(res);
                }
            });
        });

        this.resourceService.getResourcesInfo(resources).subscribe(
            resInfos => {
                resInfos.forEach((res: ARTURIResource) => {
                    this.issues.forEach((issue: Issue) => {
                        if (issue.getLabels().indexOf(res.getURI()) != -1) {
                            issue.addResource(res);
                        }
                    });
                });
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

    private onResourceClick(resource: ARTURIResource) {
        this.sharedModals.openResourceView(resource);
    }

}