import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { CollaborationServices } from "../../services/collaborationServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBCollaboration } from "../../utils/VBCollaboration";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "collaboration-proj-modal",
    templateUrl: "./collaborationProjectModal.html",
})
export class CollaborationProjectModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockDiv') blockDivElement: ElementRef;

    private headers: string[];
    private projects: any[] = [];
    private selectedProject: any;

    constructor(public dialog: DialogRef<BSModalContext>, private collaborationService: CollaborationServices, 
        private vbCollaboration: VBCollaboration, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.initProjectList();
    }

    private initProjectList() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.collaborationService.listProjects().subscribe(
            resp => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.headers = resp.headers;
                this.projects = resp.projects;
            },
            (err: Error) => {
                if (err.name.endsWith("ConnectException")) {
                    this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
                        "Connection to Collaboration System server failed." , "error", err.name + " " + err.message);
                } else if (err.name.endsWith("CollaborationBackendException")) {
                    this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
                        "Connection to Collaboration System server failed during the Login. Please check the credentials.", "error", err.stack);
                }
                this.vbCollaboration.setWorking(false);
                this.dialog.dismiss();
            }
        );
    }

    private createProject() {
        let projectProps: { [key: string]: string } = {};
        this.headers.forEach((h: string) => 
            projectProps[h] = null
        );
        this.basicModals.promptProperties("Create project", projectProps, false).then(
            props => {
                this.collaborationService.createProject(props).subscribe(
                    stResp => {
                        this.initProjectList();
                    }
                );
            },
            () => {}
        );
    }

    private selectProject(p: { id: string, key: string, name: string }) {
        this.selectedProject = p;
    }


    ok(event: Event) {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.collaborationService.assignProject(this.selectedProject).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                event.stopPropagation();
                event.preventDefault();
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }
 
}