import { Component, Input, SimpleChanges } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ConfirmCheckOptions } from 'src/app/widget/modal/basicModal/confirmModal/confirmCheckModal';
import { ModalOptions, ModalType, Translation } from 'src/app/widget/modal/Modals';
import { AlignmentCell, AlignmentOverview, AlignmentRelationSymbol } from '../../models/Alignment';
import { ARTURIResource, LocalResourcePosition, RDFResourceRolesEnum, ResourcePosition } from "../../models/ARTResources";
import { Project } from "../../models/Project";
import { EDOAL } from '../../models/Vocabulary';
import { AlignmentServices } from "../../services/alignmentServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { Cookie } from "../../utils/Cookie";
import { HttpServiceContext } from "../../utils/HttpManager";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from '../../utils/VBContext';
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { MappingPropertySelectionModal } from './alignmentValidationModals/mappingPropertySelectionModal';
import { ValidationReportModal } from './alignmentValidationModals/validationReportModal';
import { ValidationSettingsModal } from './alignmentValidationModals/validationSettingsModal';

@Component({
    selector: 'alignment-management',
    templateUrl: './alignmentManagementComponent.html',
    host: { class: "vbox" }
})
export class AlignmentManagementComponent {

    @Input() overview: AlignmentOverview; //not used, useful in order to trigger the reload of the alignment cells when it changes
    @Input() leftProject: Project;
    @Input() rightProject: Project;

    isEdoal: boolean;

    alignmentCellList: Array<AlignmentCell> = [];

    //for pagination
    private page: number = 0;
    totPage: number;

    //quick actions
    private qaNull: string = "---";
    private qaAcceptAll: string = "Accept all";
    private qaAcceptAllAbove: string = "Accept all above threshold";
    private qaRejectAll: string = "Reject all";
    private qaRejectAllUnder: string = "Reject all under threshold";
    quickActionList: string[] = [this.qaNull, this.qaAcceptAll, this.qaAcceptAllAbove, this.qaRejectAll, this.qaRejectAllUnder];
    chosenQuickAction: string = this.quickActionList[0];
    private threshold: number = 0.0;

    //settings
    private rejectedAlignmentAction: string; //ask, delete or skip
    private showRelationType: string; //relation, dlSymbol or text
    private confOnMeter: boolean; //tells if relation confidence should be shown on meter
    private alignmentPerPage: number; //max alignments per page
    rendering: boolean = true;

    private unknownRelation: boolean = false; //keep trace if there is some unknown relation (not a symbol, e.g. a classname)
    private knownRelations: string[] = AlignmentRelationSymbol.getKnownRelations();
    private relationSymbols: AlignmentRelationSymbol[];

    constructor(private alignmentService: AlignmentServices, private resourceService: ResourcesServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.isEdoal = VBContext.getWorkingProject().getModelType() == EDOAL.uri;
    }

    ngOnChanges(changes: SimpleChanges) {
        this.initSettings();
        if (changes['overview'] && changes['overview'].currentValue) {
            this.relationSymbols = AlignmentRelationSymbol.getDefaultRelations();
            this.updateRelationSymbols();
            this.updateAlignmentCells();
        }
    }

    private updateRelationSymbols() {
        for (var i = 0; i < this.overview.unknownRelations.length; i++) {
            this.relationSymbols.push({
                relation: this.overview.unknownRelations[i],
                dlSymbol: this.overview.unknownRelations[i],
                text: this.overview.unknownRelations[i]
            });
        }
    }


    /**
     * Gets alignment cells so updates the tables 
     */
    private updateAlignmentCells() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.alignmentService.listCells(this.page, this.alignmentPerPage).subscribe(
            map => {
                this.totPage = map.totPage;
                this.alignmentCellList = map.cells;
                //check if there is at least an unknown relation (could be a classname)
                //useful to enlarge the progress bar in the view in order to contains the relation name
                this.unknownRelation = false;
                for (var i = 0; i < this.alignmentCellList.length; i++) {
                    let relation = this.alignmentCellList[i].getRelation();
                    if (this.knownRelations.indexOf(relation) == -1) {
                        this.unknownRelation = true;
                        break;
                    }
                }

                //update the rendering of the entities
                let computeRenderingFn: Observable<void>[] = [];
                //source dataset
                computeRenderingFn.push(this.computeRendering(this.leftProject, "left"));
                //target dataset
                this.detectRightProject().subscribe(
                    () => {
                        if (this.rightProject != null) {
                            computeRenderingFn.push(this.computeRendering(this.rightProject, "right"));
                        }

                        forkJoin(computeRenderingFn).subscribe(
                            () => {
                                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen)
                            }
                        );
                    }
                );
                
            }
        );
    }

    private computeRendering(project: Project, dataset: "left" | "right"): Observable<void> {
        //collect the entities to annotate
        let entities: ARTURIResource[] = [];
        this.alignmentCellList.forEach(cell => {
            let entity: ARTURIResource = dataset == "left" ? cell.getEntity1() : cell.getEntity2();
            entities.push(entity);
        });
        //annotate them
        HttpServiceContext.setContextProject(project); //set a temporary context project
        return this.resourceService.getResourcesInfo(entities).pipe(
            finalize(() => HttpServiceContext.removeContextProject()),
            map(renderedResources => {
                this.alignmentCellList.forEach(cell => {
                    for (let i = 0; i < renderedResources.length; i++) {
                        if (dataset == "left" && cell.getEntity1().equals(renderedResources[i])) {
                            cell.setEntity1(<ARTURIResource>renderedResources[i]);
                            break; //go to the next entity
                        } else if (dataset == "right" &&  cell.getEntity2().equals(renderedResources[i])) {
                            cell.setEntity2(<ARTURIResource>renderedResources[i]);
                            break; //go to the next entity
                        }
                    }           
                })
            })
        );
    }

    /**
     * In case the right project is not provided (generally in alignment from file), try to detect the right project
     * by getting the resource position of the first aligned entity
     */
    private detectRightProject(): Observable<void> {
        if (this.rightProject != null) { //right project provided in @Input() => do not detect it
            return of(null);
        } else {
            return this.resourceService.getResourcePosition(this.alignmentCellList[0].getEntity2()).pipe(
                map((position: ResourcePosition) => {
                    //if target entities are from a local project, get the information of them
                    if (position.isLocal()) {
                        this.rightProject = new Project((<LocalResourcePosition>position).project);
                    }
                })
            );
        }
    }

    /**
     * List cells of previous page.
     */
    private prevPage() {
        this.page--;
        this.updateAlignmentCells();
    }

    /**
     * List cells of next page.
     */
    private nextPage() {
        this.page++;
        this.updateAlignmentCells();
    }

    /**
     * Listener to the "Accept" button. Accepts the alignment and updates the UI
     */
    private acceptAlignment(cell: AlignmentCell) {
        this.alignmentService.acceptAlignment(cell.getEntity1(), cell.getEntity2(), cell.getRelation(), cell.getEntity1().getRole()).subscribe(
            resultCell => {
                //replace the accepted alignment cell with the returned one (keeping the "rendered" entities)
                let cellToUpdateIdx = this.getIndexOfCell(cell);
                resultCell.setEntity1(this.alignmentCellList[cellToUpdateIdx].getEntity1());
                resultCell.setEntity2(this.alignmentCellList[cellToUpdateIdx].getEntity2());
                this.alignmentCellList[cellToUpdateIdx] = resultCell;
                if ((<AlignmentCell>resultCell).getStatus() == "error") {
                    this.selectMappingProperty(resultCell).then(
                        (data: any) => {
                            let mappingProp: ARTURIResource = data.property;
                            let setAsDefault: boolean = data.setAsDefault;
                            this.alignmentService.acceptAlignment(cell.getEntity1(), cell.getEntity2(), cell.getRelation(), data.property, data.setAsDefault).subscribe(
                                resultCell => {
                                    //replace the accepted alignment cell with the returned one
                                    this.replaceAlignmentCell(resultCell);
                                }
                            )
                        },
                        () => {}
                    )
                }
            }
        )
    }

    /**
     * 
     * @param cell 
     */
    private selectMappingProperty(cell: AlignmentCell) {
        const modalRef: NgbModalRef = this.modalService.open(MappingPropertySelectionModal, new ModalOptions());
        modalRef.componentInstance.title = "Invalid relation";
		modalRef.componentInstance.message = cell.getComment();
		modalRef.componentInstance.resource = cell.getEntity1();
        return modalRef.result;
    }

    /**
     * Listener to the "Reject" button. Rejects the alignment and updates the UI
     */
    private rejectAlignment(cell: AlignmentCell) {
        this.alignmentService.rejectAlignment(cell.getEntity1(), cell.getEntity2(), cell.getRelation()).subscribe(
            resultCell => {
                //replace the rejected alignment cell with the returned one (keeping the "rendered" entities)
                let cellToUpdateIdx = this.getIndexOfCell(cell);
                resultCell.setEntity1(this.alignmentCellList[cellToUpdateIdx].getEntity1());
                resultCell.setEntity2(this.alignmentCellList[cellToUpdateIdx].getEntity2());
                this.alignmentCellList[cellToUpdateIdx] = resultCell;
            }
        )
    }

    /**
     * Returns the relation symbol rendered according to the show type in settings (relation, dlSymbol or text)
     */
    private getRelationRendered(cell: AlignmentCell): string {
        var result = cell.getRelation();
        var rel = cell.getRelation();
        for (var i = 0; i < this.relationSymbols.length; i++) {
            if (this.relationSymbols[i].relation == rel) {
                result = this.relationSymbols[i][this.showRelationType];
                break;
            }
        }
        if (this.confOnMeter) {
            result += " (" + cell.getMeasure() + ")";
        }
        return result;
    }

    /**
     * Called when user changes the relation of an alignment. Changes the relation and updates the UI.
     */
    private changeRelation(cell: AlignmentCell, relation: string) {
        //change relation only if user choses a relation different from the current
        if (cell.getRelation() != relation) {
            this.basicModals.confirm({key:"ALIGNMENT.ACTIONS.CHANGE_RELATION"}, {key:"MESSAGES.ALIGNMENT_RELATION_MANUALLY_SET_CONFIRM"},
                ModalType.warning).then(
                (confirm: any) => {
                    this.alignmentService.changeRelation(cell.getEntity1(), cell.getEntity2(), cell.getRelation(), relation).subscribe(
                        resultCell => {//replace the alignment cell with the new one
                            this.replaceAlignmentCell(resultCell);
                        }
                    )
                },
                () => { }
            );
        }
    }

    /**
     * Called when user click on menu to change the mapping property of an alignment.
     * Useful to populate the menu of the mapping properties.
     * Retrieves the suggested mapping properties and set them to the alignment cell.
     */
    private getSuggestedMappingProperties(cell: AlignmentCell) {
        //call the service only if suggested properties for the given cell is not yet initialized
        if (cell.getSuggestedMappingProperties() == null) {
            //mention is not a valid role in ST, so get the role with fallback to individual
            let role = cell.getEntity1().getRole();
            if (role == RDFResourceRolesEnum.mention) {
                role = RDFResourceRolesEnum.individual;
            }
            this.alignmentService.getSuggestedProperties(role, cell.getRelation()).subscribe(
                props => {
                    props
                    cell.setSuggestedMappingProperties(props);
                }
            );
        } else {
            return cell.getSuggestedMappingProperties();
        }
        
    }

    /**
     * Called when user changes the mapping prop of an alignment. Changes the the prop and updates the UI.
     */
    private changeMappingProperty(cell: AlignmentCell, property: ARTURIResource) {
        //change property only if the user choses a property different from the current.
        if (property.getURI() != cell.getMappingProperty().getURI()) {
            this.alignmentService.changeMappingProperty(cell.getEntity1(), cell.getEntity2(), cell.getRelation(), property).subscribe(
                resultCell => {//replace the alignment cell with the new one
                    this.replaceAlignmentCell(resultCell);
                }
            );
        }
    }

    /**
     * Replace an alignment cell returned after an update with the existing one into the alignmentCellList array.
     * It avoids to replace it simply with cell=newCell since this would require to invoce again a getResourcesInfo on
     * the entities envolved. So, this method replaces all the attributes execpt entity1 and entity2
     * @param alignmentCell 
     */
    private replaceAlignmentCell(alignmentCell: AlignmentCell) {
        let cellToReplace: AlignmentCell = this.alignmentCellList[this.getIndexOfCell(alignmentCell)];
        cellToReplace.setComment(alignmentCell.getComment());
        cellToReplace.setMappingProperty(alignmentCell.getMappingProperty());
        cellToReplace.setMeasure(alignmentCell.getMeasure());
        cellToReplace.setRelation(alignmentCell.getRelation());
        cellToReplace.setStatus(alignmentCell.getStatus());
        cellToReplace.setSuggestedMappingProperties(alignmentCell.getSuggestedMappingProperties());
    }

    /**
     * Opens a modal dialog to edit the settings
     */
    openSettings() {
        var oldAlignPerPage = +Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE);
        this.modalService.open(ValidationSettingsModal, new ModalOptions()).result.then(
            () => {
                //update settings
                this.rejectedAlignmentAction = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION);
                this.showRelationType = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_RELATION_SHOW);
                this.confOnMeter = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_SHOW_CONFIDENCE) == "true";
                this.alignmentPerPage = +Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE);
                if (oldAlignPerPage != this.alignmentPerPage) {
                    this.page = 0;
                    this.updateAlignmentCells();
                }
            },
            () => { }
        );
    }

    private initSettings() {
        //init settings (where not provided, set a default)
        this.rejectedAlignmentAction = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION);
        if (this.rejectedAlignmentAction == null) {
            this.rejectedAlignmentAction = "ask";
            Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION, this.rejectedAlignmentAction);
        }
        this.showRelationType = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_RELATION_SHOW);
        if (this.showRelationType == null) {
            this.showRelationType = "relation";
            Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_RELATION_SHOW, this.showRelationType);
        }
        this.confOnMeter = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_SHOW_CONFIDENCE) == "true";
        this.alignmentPerPage = +Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE);
        if (this.alignmentPerPage == 0) {
            this.alignmentPerPage = 15;
            Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE, this.alignmentPerPage + "");
        }
        this.rendering = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_RENDERING) != "false";
    }

    toggleRendering() {
        this.rendering = !this.rendering;
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_RENDERING, this.rendering+"");
    }

    doQuickAction() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        if (this.chosenQuickAction == this.qaAcceptAll) {
            this.alignmentService.acceptAllAlignment().subscribe(
                cells => {
                    this.updateAlignmentListAfterQuickAction(cells);
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                }
            )
        } else if (this.chosenQuickAction == this.qaAcceptAllAbove) {
            this.alignmentService.acceptAllAbove(this.threshold).subscribe(
                cells => {
                    this.updateAlignmentListAfterQuickAction(cells);
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                }
            )
        } else if (this.chosenQuickAction == this.qaRejectAll) {
            this.alignmentService.rejectAllAlignment().subscribe(
                cells => {
                    this.updateAlignmentListAfterQuickAction(cells);
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                }
            )
        } else if (this.chosenQuickAction == this.qaRejectAllUnder) {
            this.alignmentService.rejectAllUnder(this.threshold).subscribe(
                cells => {
                    this.updateAlignmentListAfterQuickAction(cells);
                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                }
            )
        }
    }

    /**
     * Called after a quick action. Updates the list of the alignment cell
     */
    private updateAlignmentListAfterQuickAction(newAlignmentList: Array<AlignmentCell>) {
        for (var i = 0; i < newAlignmentList.length; i++) {
            //replace the updated alignment cell with the returned (keeping the "rendered" entities)
            let newCell = newAlignmentList[i];
            let cellToUpdateIdx = this.getIndexOfCell(newCell);
            if (cellToUpdateIdx != -1) { //cell available in the current page
                newCell.setEntity1(this.alignmentCellList[cellToUpdateIdx].getEntity1());
                newCell.setEntity2(this.alignmentCellList[cellToUpdateIdx].getEntity2());
                this.alignmentCellList[cellToUpdateIdx] = newCell;
            }
        }
    }

    /**
     * Listener to "Apply to dataset/Edoal linkset" button
     */
    applyValidation() {
        let message: Translation;
        if (this.isEdoal) {
            if (this.rejectedAlignmentAction == "skip" || this.rejectedAlignmentAction == "ask") {
                message = {key:"MESSAGES.ADD_ALIGNMENT_TO_EDOAL_CONFIRM"};
            } else {
                message = {key:"MESSAGES.ADD_DELETE_ALIGNMENT_TO_EDOAL_CONFIRM"};
            }
        } else {
            if (this.rejectedAlignmentAction == "skip" || this.rejectedAlignmentAction == "ask") {
                message = {key:"MESSAGES.ADD_ALIGNMENT_TO_ONTO_CONFIRM"};
            } else {
                message = {key:"MESSAGES.ADD_DELETE_ALIGNMENT_TO_ONTO_CONFIRM"};
            }
        }

        if (this.rejectedAlignmentAction == "skip" || this.rejectedAlignmentAction == "delete") {
            this.basicModals.confirm({ key: "ALIGNMENT.ACTIONS.APPLY_VALIDATION" }, message, ModalType.warning).then(
                () => {
                    let deleteRejected = this.rejectedAlignmentAction == "delete";
                    if (this.isEdoal) {
                        this.applyToEdoalLinkset(deleteRejected)
                    } else {
                        this.applyToDataset(deleteRejected);
                    }
                    
                },
                () => { }
            );
        } else { //ask
            this.basicModals.confirmCheck({ key: "ALIGNMENT.ACTIONS.APPLY_VALIDATION" }, message, [{ label: "Delete triples of rejected alignments", value: false }], ModalType.warning).then(
                (checkOpts: ConfirmCheckOptions[]) => {
                    if (this.isEdoal) {
                        this.applyToEdoalLinkset(checkOpts[0].value)
                    } else {
                        this.applyToDataset(checkOpts[0].value);
                    }
                },
                () => { }
            );
        }
    }

    /**
     * calls the service to apply the validation and shows the report dialog.
     */
    private applyToDataset(deleteRejected: boolean) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.alignmentService.applyValidation(deleteRejected).subscribe(
            report => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                //open report modal
                const modalRef: NgbModalRef = this.modalService.open(ValidationReportModal, new ModalOptions('lg'));
                modalRef.componentInstance.report = report;
                return modalRef.result;
            }
        )
    }

    private applyToEdoalLinkset(deleteRejected: boolean) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.alignmentService.applyValidationToEdoal(deleteRejected).subscribe(
            () => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert({ key: "ALIGNMENT.ACTIONS.APPLY_TO_EDOAL" }, {key:"MESSAGES.ALL_CORRESPONDENCES_ADDED"});
            }
        );
    }

    export() {
        this.alignmentService.exportAlignment().subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink({ key: "ALIGNMENT.ACTIONS.EXPORT_ALIGNMENT" }, {key:"MESSAGES.ALIGNMENT_VALIDATION_DATA_STORING_WARN"}, 
                    exportLink, "alignment.rdf");
            }
        );
    }

    /**
     * Retrieves the index of the given cell from the alignmentList so that the cell can be changed and
     * changes on model reflect on view
     */
    private getIndexOfCell(cell: AlignmentCell): number {
        return this.alignmentCellList.findIndex(c =>
            c.getEntity1().getURI() == cell.getEntity1().getURI() && c.getEntity2().getURI() == cell.getEntity2().getURI());
    }

    private openResView(resource: ARTURIResource, rightProject: boolean) {
        if (rightProject) {
            HttpServiceContext.setContextProject(this.rightProject);
        }
        this.sharedModals.openResourceView(resource, true).then(
            () => {
                HttpServiceContext.removeContextProject();
            },
            () => {}
        );
    }
}