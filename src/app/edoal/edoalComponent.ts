import { Component } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { Observable } from "rxjs";
import { AlignmentRelationSymbol, Correspondence } from "../models/Alignment";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { Project } from "../models/Project";
import { OntoLex, OWL, RDFS, SKOS } from "../models/Vocabulary";
import { EdoalServices } from "../services/edoalServices";
import { ProjectServices } from "../services/projectServices";
import { ProjectContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { ChangeMeasureModal, ChangeMeasureModalData } from "./changeMeasureModal";

@Component({
    selector: "edoal-component",
    templateUrl: "./edoalComponent.html",
    host: { class: "pageComponent" }
})
export class EdoalComponent {

    /**
     * Projects and tabs
     */
    private contextInitialized: boolean = false;
    private leftProjCtx: ProjectContext;
    private rightProjCtx: ProjectContext;
    private leftHiddenTabs: RDFResourceRolesEnum[] = [];
    private rightHiddenTabs: RDFResourceRolesEnum[] = [];

    /**
     * Alignments
     */
    private alignemnts: ARTResource[]; //nodes of alignments

    private correspondences: Correspondence[];
    private selectedCorrespondence: Correspondence;

    private leftSelectedResource: ARTURIResource = null;
    private rightSelectedResource: ARTURIResource = null;
    private relations: AlignmentRelationSymbol[] = AlignmentRelationSymbol.getDefaultRelations();
    private selectedRelation: AlignmentRelationSymbol;
    private measure: number = 1.0;

    constructor(private edoalService: EdoalServices, private projectService: ProjectServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) {}

    ngOnInit() {
        this.initProjects();
    }
    
    initProjects() {
        this.edoalService.getAlignedProjects().subscribe(
            projects => {
                let leftProjectName: string = projects[0];
                let rightProjectName: string = projects[1];

                let leftProject: Project = new Project(leftProjectName);
                let rightProject: Project = new Project(rightProjectName);

                let describeProjFn: Observable<any>[] = [
                    this.projectService.getProjectInfo(leftProjectName).map(
                        proj => {
                            leftProject = proj;
                            this.leftHiddenTabs = this.initHiddenTabsOfProject(leftProject);
                        }
                    ),
                    this.projectService.getProjectInfo(rightProjectName).map(
                        proj => {
                            rightProject = proj;
                            this.rightHiddenTabs = this.initHiddenTabsOfProject(rightProject);
                        }
                    )
                ];

                Observable.forkJoin(describeProjFn).subscribe(
                    () => {
                        this.leftProjCtx = new ProjectContext();
                        this.leftProjCtx.setProject(leftProject);
                        let initLeftProjectCtxFn: Observable<void>[] = [
                            this.vbProp.initProjectUserBindings(this.leftProjCtx),
                            this.vbProp.initUserProjectPreferences(this.leftProjCtx),
                            this.vbProp.initProjectSettings(this.leftProjCtx)
                        ];

                        this.rightProjCtx = new ProjectContext();
                        this.rightProjCtx.setProject(rightProject);
                        let initRightProjectCtxFn: Observable<void>[] = [
                            this.vbProp.initProjectUserBindings(this.rightProjCtx),
                            this.vbProp.initUserProjectPreferences(this.rightProjCtx),
                            this.vbProp.initProjectSettings(this.rightProjCtx)
                        ];

                        Observable.forkJoin(...initLeftProjectCtxFn, ...initRightProjectCtxFn).subscribe(
                            () => {
                                this.contextInitialized = true;
                                this.initAlignments();
                            }
                        );
                    }
                );
            }
        );
    }

    private initHiddenTabsOfProject(project: Project): RDFResourceRolesEnum[] {
        let hiddenTabs: RDFResourceRolesEnum[] = [];
        if (project.getModelType() == RDFS.uri) {
            hiddenTabs.push(RDFResourceRolesEnum.dataRange);
        } else if (project.getModelType() == OWL.uri) {
            hiddenTabs.push(RDFResourceRolesEnum.dataRange);
        } else if (project.getModelType() == SKOS.uri) {
            hiddenTabs.push(...[RDFResourceRolesEnum.cls, RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.property, RDFResourceRolesEnum.dataRange])
        } else if (project.getModelType() == OntoLex.uri) {
            hiddenTabs.push(...[RDFResourceRolesEnum.cls,  RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme,
                RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.property, RDFResourceRolesEnum.dataRange]);
        }
        return hiddenTabs;
    }

    private initAlignments() {
        this.edoalService.getAlignments().subscribe(
            alignments => {
                this.alignemnts = alignments;
                this.listCorrespondences();
            }
        )
    }

    /** ======================
     * Correspondence handlers
     * ====================== */

    private listCorrespondences() {
        this.edoalService.getCorrespondences(this.alignemnts[0]).subscribe(
            correspondences => {
                this.correspondences = correspondences;
                this.selectedCorrespondence = null;
            }
        );
    }

    private selectCorrespondence(correspondece: Correspondence) {
        if (this.selectedCorrespondence == correspondece) {
            this.selectedCorrespondence = null;
        } else {
            this.selectedCorrespondence = correspondece;
        }
    }

    private addCorrespondence() {
        if (this.measure < 0 || this.measure > 1) {
            this.basicModals.alert("Invalid measure", "The entered measure (" + this.measure + ") is invalid, it must be between 0 and 1.", "warning");
            return;
        }
        this.edoalService.createCorrespondence(this.alignemnts[0], this.leftSelectedResource, this.rightSelectedResource, this.selectedRelation.relation, this.measure).subscribe(
            () => {
                this.selectedRelation = null;
                this.measure = 1.0;
                this.listCorrespondences();
            }
        );
    }

    private deleteCorrespondece() {
        this.edoalService.deleteCorrespondence(this.selectedCorrespondence.identity).subscribe(
            () => {
                this.listCorrespondences();
            }
        );
    }

    private changeRelation(correspondence: Correspondence, relation: AlignmentRelationSymbol) {
        this.edoalService.setRelation(correspondence.identity, relation.relation).subscribe(
            () => {
                this.listCorrespondences();
            }
        )
    }

    private changeMeasure(correspondence: Correspondence) {
        var modalData = new ChangeMeasureModalData("Edit measure", <number><any>correspondence.measure[0].getShow());
        const builder = new BSModalContextBuilder<ChangeMeasureModalData>(
            modalData, undefined, ChangeMeasureModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(ChangeMeasureModal, overlayConfig).result.then(
            newMeasure => {
                this.edoalService.setMeasure(correspondence.identity, newMeasure).subscribe(
                    () => {
                        this.listCorrespondences();
                    }
                );
            },
            () => {}
        );
    }

    /** ======================
     * Tabset handlers
     * ====================== */

    private openLeftResourceView() {
        this.sharedModals.openResourceView(this.leftSelectedResource, true, this.leftProjCtx);
    }
    private openRightResourceView() {
        this.sharedModals.openResourceView(this.rightSelectedResource, true, this.rightProjCtx);
    }

    private onLeftResourceSelected(resource: ARTURIResource) {
        this.leftSelectedResource = resource;
    }

    private onRightResourceSelected(resource: ARTURIResource) {
        this.rightSelectedResource = resource;
    }

}