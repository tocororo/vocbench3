import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ARTURIResource, ResourceUtils } from '../models/ARTResources';
import { Issue, IssuesListCtx, IssuesStruct } from '../models/Collaboration';
import { CollaborationServices } from "../services/collaborationServices";
import { ResourcesServices } from '../services/resourcesServices';
import { UIUtils } from '../utils/UIUtils';
import { VBCollaboration } from '../utils/VBCollaboration';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: 'issue-list',
    templateUrl: './issueListComponent.html',
    host: { 
        class: "blockingDivHost vbox",
    }
})
export class IssueListComponent {

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;
    @Output() issueSelected: EventEmitter<Issue> = new EventEmitter();
    @Input() context: IssuesListCtx = IssuesListCtx.Dashboard;

    private issues: Issue[];
    private selectedIssue: Issue;
    //for paging
    private showPaging: boolean = false;
    private page: number = 0;
    private totPage: number;

    constructor(private collaborationService: CollaborationServices, private resourceService: ResourcesServices, private vbCollaboration: VBCollaboration, 
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {}

    ngOnInit() {
        this.listIssues();
    }

    private listIssues() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.collaborationService.listIssues(this.page).subscribe(
            (issuesStruct: IssuesStruct) => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.issues = issuesStruct.issues;
                this.enrichIssuesWithResources();
                this.totPage = issuesStruct.numPagesTotal;
                this.showPaging = issuesStruct.numIssues > this.issues.length;
                this.vbCollaboration.setWorking(true); //necessary to (eventually) wake up the CS handlers in the open ResViews
            },
            (err: Error) => {
                //in case listIssues throws an exception set the "working" flag to false
                if (err.name.endsWith("ConnectException")) {
                    this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
                        "Connection to Collaboration System server failed." , "error", err.name + " " + err.message);
                } else if (err.name.endsWith("CollaborationBackendException")) {
                    this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
                        "Connection to Collaboration System server failed during the Login. Please check the credentials.", "error", err.stack);
                }
                this.vbCollaboration.setWorking(false);
            }
        );
    }

    private enrichIssuesWithResources() {
        if (this.context == IssuesListCtx.Dashboard) { //get the resources description only if the list is in the dashboard
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
    }

    private selectIssue(issue: Issue) {
        if (this.context == IssuesListCtx.Assignment) { //allow selection of issue only if the list is in the modal for the assignment
            if (this.selectedIssue == issue) {
                this.selectedIssue = null;
            } else {
                this.selectedIssue = issue;
            }
            this.issueSelected.emit(this.selectedIssue);
        }
    }

    private previousPage() {
        this.page--;
        this.listIssues();
    }
    private nextPage() {
        this.page++;
        this.listIssues();
    }

    private onResourceClick(resource: ARTURIResource) {
        this.sharedModals.openResourceView(resource, true);
    }

    /**
     * Refresh the list of issue from outside
     */
    public refresh() {
        this.page = 0;
        this.listIssues();
    }

}