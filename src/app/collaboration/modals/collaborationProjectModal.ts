import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { CollaborationServices } from "../../services/collaborationServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBCollaboration } from "../../utils/VBCollaboration";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "collaboration-proj-modal",
    templateUrl: "./collaborationProjectModal.html",
})
export class CollaborationProjectModal {

    @ViewChild('blockDiv', { static: true }) blockDivElement: ElementRef;

    headers: string[];
    projects: any[] = [];
    selectedProject: any;

    constructor(public activeModal: NgbActiveModal, private collaborationService: CollaborationServices, 
        private vbCollaboration: VBCollaboration, private basicModals: BasicModalServices) {
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
                    this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.CANNOT_RETRIEVE_ISSUES_CONNECTION_FAILED"}, ModalType.error, err.name + " " + err.message);
                } else if (err.name.endsWith("CollaborationBackendException")) {
                    this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.CANNOT_RETRIEVE_ISSUES_LOGIN_FAILED"}, ModalType.error, err.stack);
                }
                this.vbCollaboration.setWorking(false);
                this.activeModal.dismiss();
            }
        );
    }

    createProject() {
        let projectProps: { [key: string]: string } = {};
        this.headers.forEach((h: string) => 
            projectProps[h] = null
        );
        this.basicModals.promptProperties({key:"ACTIONS.CREATE_PROJECT"}, projectProps, false).then(
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

    selectProject(p: { id: string, key: string, name: string }) {
        this.selectedProject = p;
    }


    ok() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.collaborationService.assignProject(this.selectedProject).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }
 
}