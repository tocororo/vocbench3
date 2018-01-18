import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { CollaborationServices } from "../services/collaborationServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "collaboration-proj-modal",
    templateUrl: "./collaborationProjectModal.html",
})
export class CollaborationProjectModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockDiv') blockDivElement: ElementRef;

    private projects: { id: string, key: string, name: string }[];
    private selectedProject: { id: string, key: string, name: string }

    constructor(public dialog: DialogRef<BSModalContext>, private collaborationService: CollaborationServices, 
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.collaborationService.listProjects().subscribe(
            projects => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.projects = projects;
            }
        )
    }

    private selectProject(p: { id: string, key: string, name: string }) {
        this.selectedProject = p;
    }


    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }
 
}