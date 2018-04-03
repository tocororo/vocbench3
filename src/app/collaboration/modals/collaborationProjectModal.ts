import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { CollaborationServices } from "../../services/collaborationServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { VBCollaboration } from "../../utils/VBCollaboration";

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
                this.basicModals.alert("Error", "Cannot retrieve the projects list. Connection to Collaboration System server failed." ,
                    "error", err.name + " " + err.message).then(
                    () => {
                        this.vbCollaboration.setWorking(false);
                        this.dialog.dismiss();
                    }
                );
            }
        );
    }

    private createProject() {
        let projectProps: { [key: string]: string } = {
            name: null, 
            key: null
        };
        this.basicModals.promptProperties("Create project", projectProps).then(
            props => {
                let projectName = props.name;
                let projectKey = props.key;
                this.collaborationService.createProject(projectName, projectKey).subscribe(
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
        this.collaborationService.assignProject(this.selectedProject.name, this.selectedProject.key, this.selectedProject.id).subscribe(
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