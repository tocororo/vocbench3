import { Component, ElementRef, ViewChild } from '@angular/core';
import { Modal, OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { AlignmentOverview } from '../../models/Alignment';
import { GenomaTask } from '../../models/Genoma';
import { Project } from "../../models/Project";
import { EdoalServices } from '../../services/edoalServices';
import { GenomaServices } from '../../services/genomaServices';
import { MapleServices } from '../../services/mapleServices';
import { ProjectServices } from '../../services/projectServices';
import { HttpServiceContext } from '../../utils/HttpManager';
import { UIUtils } from '../../utils/UIUtils';
import { ProjectContext } from '../../utils/VBContext';
import { BasicModalServices } from '../../widget/modal/basicModal/basicModalServices';
import { AlignFromSource } from './alignFromSource';
import { CreateGenomaTaskModal, CreateGenomaTaskModalData } from './alignmentValidationModals/createGenomaTaskModal';

@Component({
    selector: 'alignment-genoma',
    templateUrl: './alignFromGenomaComponent.html',
    host: { class: "vbox" }
})
export class AlignFromGenomaComponent extends AlignFromSource {

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private tasks: GenomaTask[];
    private selectedTask: GenomaTask;

    constructor(edoalService: EdoalServices, projectService: ProjectServices,
        private genomaService: GenomaServices, private mapleService: MapleServices, private basicModal: BasicModalServices, private modal: Modal) {
        super(edoalService, projectService);
    }


    init() {
        HttpServiceContext.setContextProject(this.leftProject);
        this.mapleService.checkProjectMetadataAvailability().subscribe(
            available => {
                HttpServiceContext.removeConsumerProject();
                if (available) {
                    this.listGenomaTask();
                } else {
                    this.basicModal.confirm("Unavailable metadata", "Unable to find metadata about the current project '" + 
                        this.leftProject.getName() +  "', do you want to generate them?").then(
                        confirm => {
                            UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                            this.mapleService.profileProject().subscribe(
                                () => {
                                    UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                                    this.listGenomaTask();
                                }
                            )
                        },
                        cancel => {}
                    );
                }
            }
        )
    }

    private listGenomaTask() {
        this.tasks = null;
        this.selectedTask = null;
        let allowReordering: boolean = !this.isEdoalProject(); //if project is edoal, allow only task with the exact left-right datasets
        this.genomaService.listTasks(this.leftProject, allowReordering, this.rightProject).subscribe(
            tasks => {
                this.tasks = tasks;
            }
        );
    }

    private selectTask(task: GenomaTask) {
        if (this.selectedTask == task) {
            this.selectedTask = null;
        } else {
            this.selectedTask = task
        }
    }

    private createTask() {
        //if it is an edoal project, also the right project is forced to the one set in the edoal
        let rightProject: Project = this.isEdoalProject() ? this.rightProject : null;
        var modalData = new CreateGenomaTaskModalData(this.leftProject, rightProject);
        const builder = new BSModalContextBuilder<CreateGenomaTaskModalData>(
            modalData, undefined, CreateGenomaTaskModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(CreateGenomaTaskModal, overlayConfig).result.then(
            newTaskId => {
                this.listGenomaTask();
            },
            () => {}
        );
    }

    private fetchAlignment(task: GenomaTask) {
        this.rightProject = new Project(task.rightDataset.projectName);
        this.genomaService.fetchAlignment(task.id).subscribe(
            (overview: AlignmentOverview) => {
                this.alignmentOverview = overview;
            }
        );
    }

}

class AlignedProjectStruct {
    context: ProjectContext;
    profileAvailable: boolean = false;
}