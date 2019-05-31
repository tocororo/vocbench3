import { Component } from '@angular/core';
import { Modal, OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { GenomaTask } from '../../models/Genoma';
import { Project } from "../../models/Project";
import { GenomaServices } from '../../services/genomaServices';
import { ProjectContext, VBContext } from '../../utils/VBContext';
import { AlignFromSource } from './alignFromSource';
import { CreateGenomaTaskModal, CreateGenomaTaskModalData } from './alignmentValidationModals/createGenomaTaskModal';
import { AlignmentOverview } from '../../models/Alignment';
import { MapleServices } from '../../services/mapleServices';
import { BasicModalServices } from '../../widget/modal/basicModal/basicModalServices';

@Component({
    selector: 'alignment-genoma',
    templateUrl: './alignFromGenomaComponent.html',
    host: { class: "vbox" }
})
export class AlignFromGenomaComponent extends AlignFromSource {

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
                            this.mapleService.profileProject().subscribe(
                                () => {
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






    /**
     * TWO PROJECT SIDE BY SIDE
     */

    // private leftProjCtx: ProjectContext;
    // private rightProjCtx: ProjectContext;

    // private contextInitialized: boolean = false;

    // private leftSelectedResource: ARTURIResource;
    // private rightSelectedResource: ARTURIResource;


    // ngOnInit() {

    //     this.leftProjCtx = new ProjectContext();
    //     // let leftProject = new Project("Edoal_A");
    //     let leftProject = new Project("Teseo_GDB_8.8");
    //     this.leftProjCtx.setProject(leftProject);

    //     let initLeftProjectCtxFn: Observable<void>[] = [
    //         this.getInitPUSettingsFn(this.leftProjCtx),
    //         this.getInitProjectUserBindingFn(this.leftProjCtx)
    //     ];


    //     this.rightProjCtx = new ProjectContext();
    //     // let rightProject = new Project("Edoal_B");
    //     let rightProject = new Project("Eurovoc_GDB8.8");
    //     this.rightProjCtx.setProject(rightProject);
        
    //     let initRightProjectCtxFn: Observable<void>[] = [
    //         this.getInitPUSettingsFn(this.rightProjCtx),
    //         this.getInitProjectUserBindingFn(this.rightProjCtx)
    //     ]


    //     Observable.forkJoin(...initLeftProjectCtxFn, ...initRightProjectCtxFn).subscribe(
    //         () => {
    //             console.log("leftProjCtx", this.leftProjCtx);
    //             console.log("rightProjCtx", this.rightProjCtx);
    //             this.contextInitialized = true;
    //         }
    //     );

    // }

    // private getInitPUSettingsFn(projectCtx: ProjectContext): Observable<void> {
    //     let properties: string[] = [
    //         Properties.pref_active_schemes, 
    //         Properties.pref_concept_tree_base_broader_prop, Properties.pref_concept_tree_broader_props, Properties.pref_concept_tree_narrower_props,
    //         Properties.pref_concept_tree_include_subprops, Properties.pref_concept_tree_sync_inverse, Properties.pref_concept_tree_visualization,
    //     ];

    //     let options: VBRequestOptions = new VBRequestOptions({ ctxProject: projectCtx.getProject() });
    //     return this.prefService.getPUSettings(properties, null, options).map(
    //         prefs => {
    //             let activeSchemes: ARTURIResource[] = [];
    //             let activeSchemesPref: string = prefs[Properties.pref_active_schemes];
    //             if (activeSchemesPref != null) {
    //                 let skSplitted: string[] = activeSchemesPref.split(",");
    //                 for (var i = 0; i < skSplitted.length; i++) {
    //                     activeSchemes.push(new ARTURIResource(skSplitted[i]));
    //                 }
    //             }
    //             projectCtx.getProjectPreferences().activeSchemes = activeSchemes;


    //             let conceptTreePreferences: ConceptTreePreference = new ConceptTreePreference();
    //             let conceptTreeBaseBroaderPropPref: string = prefs[Properties.pref_concept_tree_base_broader_prop];
    //             if (conceptTreeBaseBroaderPropPref != null) {
    //                 conceptTreePreferences.baseBroaderUri = conceptTreeBaseBroaderPropPref;
    //             }
    //             let conceptTreeBroaderPropsPref: string = prefs[Properties.pref_concept_tree_broader_props];
    //             if (conceptTreeBroaderPropsPref != null) {
    //                 conceptTreePreferences.broaderProps = conceptTreeBroaderPropsPref.split(",");
    //             }
    //             let conceptTreeNarrowerPropsPref: string = prefs[Properties.pref_concept_tree_narrower_props];
    //             if (conceptTreeNarrowerPropsPref != null) {
    //                 conceptTreePreferences.narrowerProps = conceptTreeNarrowerPropsPref.split(",");
    //             }
    //             let conceptTreeVisualizationPref: string = prefs[Properties.pref_concept_tree_visualization];
    //             if (conceptTreeVisualizationPref != null && conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased) {
    //                 conceptTreePreferences.visualization = conceptTreeVisualizationPref;
    //             }
    //             conceptTreePreferences.includeSubProps = prefs[Properties.pref_concept_tree_include_subprops] != "false";
    //             conceptTreePreferences.syncInverse = prefs[Properties.pref_concept_tree_sync_inverse] != "false";

    //             projectCtx.getProjectPreferences().conceptTreePreferences = conceptTreePreferences;
    //         }
    //     );
    // }

    // private getInitProjectUserBindingFn(projectCtx: ProjectContext): Observable<void> {
    //     return this.adminService.getProjectUserBinding(projectCtx.getProject().getName(), VBContext.getLoggedUser().getEmail()).map(
    //         pub => {
    //             projectCtx.setProjectUserBinding(pub);
    //         }
    //     );
    // }

    // onLeftResourceSelected(resource: ARTURIResource) {
    //     this.leftSelectedResource = resource;
    // }

    // onRightResourceSelected(resource: ARTURIResource) {
    //     this.rightSelectedResource = resource;
    // }

}

class AlignedProjectStruct {
    context: ProjectContext;
    profileAvailable: boolean = false;
}