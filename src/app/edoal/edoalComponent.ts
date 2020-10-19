import { Component, ViewChild } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { Observable } from "rxjs";
import { AlignmentRelationSymbol, Correspondence } from "../models/Alignment";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { Project } from "../models/Project";
import { OntoLex, OWL, RDFS, SKOS } from "../models/Vocabulary";
import { AlignmentServices } from "../services/alignmentServices";
import { EdoalServices } from "../services/edoalServices";
import { ProjectServices } from "../services/projectServices";
import { ResourcesServices } from "../services/resourcesServices";
import { TabsetPanelComponent } from "../trees/tabset/tabsetPanelComponent";
import { HttpServiceContext } from "../utils/HttpManager";
import { ResourceUtils } from "../utils/ResourceUtils";
import { ProjectContext, VBContext } from "../utils/VBContext";
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

    @ViewChild('leftTabset') leftTabset: TabsetPanelComponent;
    @ViewChild('rightTabset') rightTabset: TabsetPanelComponent;

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

    //pagination
    private page: number = 0;
    private totPage: number;
    private pageSize: number = 50;

    constructor(private edoalService: EdoalServices, private alignmentService: AlignmentServices, private projectService: ProjectServices, private resourcesService: ResourcesServices,
        private vbProp: VBProperties, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) {}

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
                        this.leftProjCtx = new ProjectContext(leftProject);
                        let initLeftProjectCtxFn: Observable<void>[] = [
                            this.vbProp.initProjectUserBindings(this.leftProjCtx),
                            this.vbProp.initUserProjectPreferences(this.leftProjCtx),
                            this.vbProp.initProjectSettings(this.leftProjCtx)
                        ];

                        this.rightProjCtx = new ProjectContext(rightProject);
                        let initRightProjectCtxFn: Observable<void>[] = [
                            this.vbProp.initProjectUserBindings(this.rightProjCtx),
                            this.vbProp.initUserProjectPreferences(this.rightProjCtx),
                            this.vbProp.initProjectSettings(this.rightProjCtx)
                        ];

                        Observable.forkJoin(...initLeftProjectCtxFn, ...initRightProjectCtxFn).subscribe(
                            () => {
                                this.contextInitialized = true;
                                this.listAlignments();
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

    private listAlignments() {
        this.ensureExistingAlignment().subscribe(
            () => {
                // this.alignemnts = alignemnts;
                //paging handler
                let totCorrespondences = this.alignemnts[0].getAdditionalProperty('correspondences');
                this.totPage = Math.floor(totCorrespondences/this.pageSize);
                if (totCorrespondences % this.pageSize > 0){
                    this.totPage++;
                }

                this.listCorrespondences();
            }
        )
    }

    private ensureExistingAlignment(): Observable<void> {
        return this.edoalService.getAlignments().flatMap(
            alignments => {
                if (alignments.length > 0) {
                    this.alignemnts = alignments
                    return Observable.of(null);
                } else {
                    return this.edoalService.createAlignment().flatMap(
                        alignmentNode => {
                            return this.edoalService.getAlignments().map(
                                alignments => {
                                    this.alignemnts = alignments;
                                }
                            );
                        }
                    )
                }
            }
        )
    }

    /** ======================
     * Correspondence handlers
     * ====================== */

    private listCorrespondences() {
        this.edoalService.getCorrespondences(this.alignemnts[0], this.page, this.pageSize).subscribe(
            correspondences => {
                this.correspondences = correspondences;
                //try to set qname of mapping property
                this.correspondences.forEach(c => {
                    c.mappingProperty.forEach(mp => {
                        mp.setShow(ResourceUtils.getQName(mp.getURI(), VBContext.getPrefixMappings()));
                    });
                })
                this.renderCorrespondences();
                this.selectedCorrespondence = null;
            },
            (err: Error) => {
                if (err.name.endsWith("IndexingLanguageNotFound")) {
                    this.basicModals.alert("Missing user language", "No user language has been detected for the project '" + 
                    this.leftProjCtx.getProject().getName() + "'. The system will not be able to initialize the list of alignments.\n" +
                    "Please access that project, then go to the user preferences and set a rendering language.", "warning");
                }
            }
        );
    }

    private renderCorrespondences() {
        let leftEntities: ARTURIResource[] = [];
        let rightEntities: ARTURIResource[] = [];
        this.correspondences.forEach(c => {
            leftEntities.push(<ARTURIResource>c.leftEntity[0]);
            rightEntities.push(<ARTURIResource>c.rightEntity[0]);
        });
        if (leftEntities.length > 0 || rightEntities.length > 0) {
            HttpServiceContext.setContextProject(this.leftProjCtx.getProject());
            this.resourcesService.getResourcesInfo(leftEntities)
            .finally(
                () => HttpServiceContext.removeContextProject()
            ).subscribe(
                resources => {
                    resources.forEach(r => {
                        this.correspondences.forEach(c => {
                            if (c.leftEntity[0].equals(r)) {
                                c.leftEntity[0] = r;
                            }
                        });
                    })
                }
            );
            HttpServiceContext.setContextProject(this.rightProjCtx.getProject());
            this.resourcesService.getResourcesInfo(rightEntities).finally(
                () => HttpServiceContext.removeContextProject()
            ).subscribe(
                resources => {
                    resources.forEach(r => {
                        this.correspondences.forEach(c => {
                            if (c.rightEntity[0].equals(r)) {
                                c.rightEntity[0] = r;
                            }
                        });
                    })
                }
            );
        }
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
                this.correspondences.splice(this.correspondences.indexOf(this.selectedCorrespondence), 1);
                this.selectedCorrespondence = null;
            }
        );
    }

    private syncCorrespondece() {
        this.leftTabset.syncResource(<ARTURIResource>this.selectedCorrespondence.leftEntity[0], true);
        this.rightTabset.syncResource(<ARTURIResource>this.selectedCorrespondence.rightEntity[0], true);
    }

    private changeRelation(correspondence: Correspondence, relation: AlignmentRelationSymbol) {
        this.edoalService.setRelation(correspondence.identity, relation.relation).subscribe(
            () => {
                this.listCorrespondences();
            }
        )
    }

    private changeMeasure(correspondence: Correspondence) {
        var modalData = new ChangeMeasureModalData(<number><any>correspondence.measure[0].getShow());
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

    private changeMappingProperty(correspondence: Correspondence, property: ARTURIResource) {
        this.edoalService.setMappingProperty(correspondence.identity, property).subscribe(
            () => {
                this.listCorrespondences();
            }
        )
    }

    /**
     * Called when user click on menu to change the mapping property.
     * Useful to populate the menu of the mapping properties.
     * Retrieves the suggested mapping properties and set them to the alignment cell.
     */
    private initSuggestedMappingProperties(correspondence: Correspondence) {
        //call the service only if suggested properties for the given cell is not yet initialized
        if (correspondence['suggestedMappingProperties'] == null) {
            //mention is not a valid role in ST, so get the role with fallback to individual
            let role = correspondence.leftEntity[0].getRole();
            if (role == RDFResourceRolesEnum.mention) {
                role = RDFResourceRolesEnum.individual;
            }
            this.alignmentService.getSuggestedProperties(role, correspondence.relation[0].getShow()).subscribe(
                props => {
                    correspondence['suggestedMappingProperties'] = props;
                }
            );
        }
    }

    /**
     * Paging
     */

    private prevPage() {
        this.page--;
        this.listCorrespondences();
    }

    private nextPage() {
        this.page++;
        this.listCorrespondences();
    }

    /** ======================
     * Tabset handlers
     * ====================== */

    private openLeftResourceView(res: ARTURIResource) {
        this.sharedModals.openResourceView(res, true, this.leftProjCtx);
    }
    private openRightResourceView(res: ARTURIResource) {
        this.sharedModals.openResourceView(res, true, this.rightProjCtx);
    }

    private onLeftResourceSelected(resource: ARTURIResource) {
        this.leftSelectedResource = resource;
    }

    private onRightResourceSelected(resource: ARTURIResource) {
        this.rightSelectedResource = resource;
    }

}