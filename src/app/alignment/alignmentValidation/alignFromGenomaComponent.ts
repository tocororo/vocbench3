import { Component, ElementRef, ViewChild } from '@angular/core';
import { Modal, OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { AlignmentOverview } from '../../models/Alignment';
import { GenomaTask } from '../../models/Genoma';
import { Project } from "../../models/Project";
import { GenomaServices } from '../../services/genomaServices';
import { MapleServices } from '../../services/mapleServices';
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

    private tasks: GenomaTask[] = [];
    private selectedTask: GenomaTask;

    constructor(private genomaService: GenomaServices, private mapleService: MapleServices, private basicModal: BasicModalServices, private modal: Modal) {
        super();
    }


    ngOnInit() {
        super.ngOnInit();

        this.mapleService.checkProjectMetadataAvailability().subscribe(
            available => {
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
        this.genomaService.listTasks(this.leftProject, true).subscribe(
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
        var modalData = new CreateGenomaTaskModalData(this.leftProject);
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