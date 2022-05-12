import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, map, mergeMap } from 'rxjs/operators';
import { AlignmentRelationSymbol, Correspondence } from "../models/Alignment";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { Project } from "../models/Project";
import { OntoLex, OWL, RDFS, SKOS } from "../models/Vocabulary";
import { AlignmentServices } from "../services/alignmentServices";
import { EdoalServices } from "../services/edoalServices";
import { ProjectServices } from "../services/projectServices";
import { ResourcesServices } from "../services/resourcesServices";
import { TabsetPanelComponent } from "../structures/tabset/tabsetPanelComponent";
import { HttpServiceContext } from "../utils/HttpManager";
import { ResourceUtils } from "../utils/ResourceUtils";
import { UIUtils } from "../utils/UIUtils";
import { ProjectContext, VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from '../widget/modal/Modals';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { ChangeMeasureModal } from "./changeMeasureModal";

@Component({
    selector: "edoal-component",
    templateUrl: "./edoalComponent.html",
    host: { class: "pageComponent" }
})
export class EdoalComponent {

    @ViewChild('leftTabset') leftTabset: TabsetPanelComponent;
    @ViewChild('rightTabset') rightTabset: TabsetPanelComponent;

    @ViewChild('blockingDiv', { static: false }) private blockingDivElement: ElementRef;

    /**
     * Projects and tabs
     */
    contextInitialized: boolean = false;
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
    totPage: number;
    private pageSize: number = 50;

    pageSelector: number[] = [];
    pageSelectorOpt: number;

    constructor(private edoalService: EdoalServices, private alignmentService: AlignmentServices, private projectService: ProjectServices, private resourcesService: ResourcesServices,
        private vbProp: VBProperties, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal) { }

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
                    this.projectService.getProjectInfo(leftProjectName).pipe(
                        map(proj => {
                            leftProject = proj;
                            this.leftHiddenTabs = this.initHiddenTabsOfProject(leftProject);
                        })
                    ),
                    this.projectService.getProjectInfo(rightProjectName).pipe(
                        map(proj => {
                            rightProject = proj;
                            this.rightHiddenTabs = this.initHiddenTabsOfProject(rightProject);
                        })
                    )
                ];

                forkJoin(describeProjFn).subscribe(
                    () => {
                        this.leftProjCtx = new ProjectContext(leftProject);
                        let initLeftProjectCtxFn: Observable<void>[] = [
                            this.vbProp.initProjectUserBindings(this.leftProjCtx),
                            this.vbProp.initUserProjectPreferences(this.leftProjCtx, true),
                            this.vbProp.initProjectSettings(this.leftProjCtx)
                        ];

                        this.rightProjCtx = new ProjectContext(rightProject);
                        let initRightProjectCtxFn: Observable<void>[] = [
                            this.vbProp.initProjectUserBindings(this.rightProjCtx),
                            this.vbProp.initUserProjectPreferences(this.rightProjCtx, true),
                            this.vbProp.initProjectSettings(this.rightProjCtx)
                        ];

                        let initFn: Observable<any>[] = initLeftProjectCtxFn.concat(initRightProjectCtxFn);
                        forkJoin(initFn).subscribe(
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
            hiddenTabs.push(...[RDFResourceRolesEnum.cls, RDFResourceRolesEnum.skosCollection, RDFResourceRolesEnum.property, RDFResourceRolesEnum.dataRange]);
        } else if (project.getModelType() == OntoLex.uri) {
            hiddenTabs.push(...[RDFResourceRolesEnum.cls, RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme,
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
                this.totPage = Math.floor(totCorrespondences / this.pageSize);
                if (totCorrespondences % this.pageSize > 0) {
                    this.totPage++;
                }

                this.pageSelector = [];
                for (let i = 0; i < this.totPage; i++) {
                    this.pageSelector.push(i);
                }

                this.listCorrespondences();
            }
        );
    }

    private ensureExistingAlignment(): Observable<void> {
        return this.edoalService.getAlignments().pipe(
            mergeMap(alignments => {
                if (alignments.length > 0) {
                    this.alignemnts = alignments;
                    return of(null);
                } else {
                    return this.edoalService.createAlignment().pipe(
                        mergeMap(() => {
                            return this.edoalService.getAlignments().pipe(
                                map(alignments => {
                                    this.alignemnts = alignments;
                                })
                            );
                        })
                    );
                }
            })
        );
    }

    /** ======================
     * Correspondence handlers
     * ====================== */

    private listCorrespondences() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.edoalService.getCorrespondences(this.alignemnts[0], this.page, this.pageSize).subscribe(
            correspondences => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.correspondences = correspondences;
                //try to set qname of mapping property
                this.correspondences.forEach(c => {
                    c.mappingProperty.forEach(mp => {
                        mp.setShow(ResourceUtils.getQName(mp.getURI(), VBContext.getPrefixMappings()));
                    });
                });
                this.renderCorrespondences();
                this.selectedCorrespondence = null;
            },
            (err: Error) => {
                if (err.name.endsWith("IndexingLanguageNotFound")) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.NO_LANG_DETECTED_IN_EDOAL_ALIGNMENT", params: { projName: this.leftProjCtx.getProject().getName() } },
                        ModalType.warning);
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
            this.resourcesService.getResourcesInfo(leftEntities).pipe(
                finalize(() => HttpServiceContext.removeContextProject())
            ).subscribe(
                resources => {
                    resources.forEach(r => {
                        this.correspondences.forEach(c => {
                            if (c.leftEntity[0].equals(r)) {
                                c.leftEntity[0] = r;
                            }
                        });
                    });
                }
            );
            HttpServiceContext.setContextProject(this.rightProjCtx.getProject());
            this.resourcesService.getResourcesInfo(rightEntities).pipe(
                finalize(() => HttpServiceContext.removeContextProject())
            ).subscribe(
                resources => {
                    resources.forEach(r => {
                        this.correspondences.forEach(c => {
                            if (c.rightEntity[0].equals(r)) {
                                c.rightEntity[0] = r;
                            }
                        });
                    });
                }
            );
        }
    }

    selectCorrespondence(correspondece: Correspondence) {
        if (this.selectedCorrespondence == correspondece) {
            this.selectedCorrespondence = null;
        } else {
            this.selectedCorrespondence = correspondece;
        }
    }

    addCorrespondence() {
        if (this.measure < 0 || this.measure > 1) {
            this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_ALIGNMENT_MEASURE" }, ModalType.warning);
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

    deleteCorrespondece() {
        this.edoalService.deleteCorrespondence(this.selectedCorrespondence.identity).subscribe(
            () => {
                this.correspondences.splice(this.correspondences.indexOf(this.selectedCorrespondence), 1);
                this.selectedCorrespondence = null;
            }
        );
    }

    syncCorrespondece() {
        this.leftTabset.syncResource(<ARTURIResource>this.selectedCorrespondence.leftEntity[0], true);
        this.rightTabset.syncResource(<ARTURIResource>this.selectedCorrespondence.rightEntity[0], true);
    }

    changeRelation(correspondence: Correspondence, relation: AlignmentRelationSymbol) {
        this.edoalService.setRelation(correspondence.identity, relation.relation).subscribe(
            () => {
                this.listCorrespondences();
            }
        );
    }

    changeMeasure(correspondence: Correspondence) {
        const modalRef: NgbModalRef = this.modalService.open(ChangeMeasureModal, new ModalOptions());
        modalRef.componentInstance.value = <number><any>correspondence.measure[0].getShow();
        return modalRef.result.then(
            newMeasure => {
                this.edoalService.setMeasure(correspondence.identity, newMeasure).subscribe(
                    () => {
                        this.listCorrespondences();
                    }
                );
            },
            () => { }
        );
    }

    changeMappingProperty(correspondence: Correspondence, property: ARTURIResource) {
        this.edoalService.setMappingProperty(correspondence.identity, property).subscribe(
            () => {
                this.listCorrespondences();
            }
        );
    }

    /**
     * Called when user click on menu to change the mapping property.
     * Useful to populate the menu of the mapping properties.
     * Retrieves the suggested mapping properties and set them to the alignment cell.
     */
    initSuggestedMappingProperties(correspondence: Correspondence) {
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

    prevPage() {
        this.page--;
        this.listCorrespondences();
    }

    nextPage() {
        this.page++;
        this.listCorrespondences();
    }

    goToPage() {
        if (this.page != this.pageSelectorOpt) {
            this.page = this.pageSelectorOpt;
            this.listCorrespondences();
        }
    }

    /** ======================
     * Tabset handlers
     * ====================== */

    openLeftResourceView(res: ARTURIResource) {
        this.sharedModals.openResourceView(res, true, this.leftProjCtx);
    }
    openRightResourceView(res: ARTURIResource) {
        this.sharedModals.openResourceView(res, true, this.rightProjCtx);
    }

    onLeftResourceSelected(resource: ARTURIResource) {
        this.leftSelectedResource = resource;
    }

    onRightResourceSelected(resource: ARTURIResource) {
        this.rightSelectedResource = resource;
    }

}