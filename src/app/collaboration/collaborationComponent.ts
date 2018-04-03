import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CollaborationProjSettingsModal } from "./modals/collaborationProjSettingsModal";
import { CollaborationProjectModal } from "./modals/collaborationProjectModal";
import { CollaborationServices } from "../services/collaborationServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { Plugin, Settings } from '../models/Plugins';
import { Issue } from '../models/Collaboration';
import { VBContext } from '../utils/VBContext';
import { UIUtils } from '../utils/UIUtils';
import { VBCollaboration } from '../utils/VBCollaboration';
import { ResourcesServices } from '../services/resourcesServices';
import { ARTURIResource, ResourceUtils } from '../models/ARTResources';
import { CollaborationModalServices } from './collaborationModalService';

@Component({
    selector: 'collaboration-component',
    templateUrl: './collaborationComponent.html',
    host: { class: "pageComponent" }
})
export class CollaborationComponent {

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    //TODO configuration only available to sys admin or users with privileges

    private projSettingsConfigured: boolean; //serverURL
    private userSettingsConfigured: boolean; //credentials
    private csProjectLinked: boolean;

    private csWorking: boolean = true;

    private issues: Issue[];

    constructor(private collaborationService: CollaborationServices, private resourceService: ResourcesServices, private vbCollaboration: VBCollaboration, 
        private collModals: CollaborationModalServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {}

    ngOnInit() {
        this.initIssueList();
    }

    private initIssueList() {
        this.issues = [];
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
                    this.csWorking = true;
                    this.vbCollaboration.setWorking(this.csWorking);
                    UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                    this.collaborationService.listIssues().subscribe(
                        issues => {
                            UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                            this.issues = issues;
                            this.enrichIssuesWithResources();
                        },
                        (err: Error) => {
                            //in case listIssues throws a ConnectException set the "working" flag to false
                            if (err.name.endsWith("ConnectException")) {
                                this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
                                    "Connection to Collaboration System server failed." , "error", err.name + " " + err.message);
                            }
                            this.csWorking = false;
                            this.vbCollaboration.setWorking(this.csWorking);
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

    private onResourceClick(resource: ARTURIResource) {
        this.sharedModals.openResourceView(resource);
    }

}