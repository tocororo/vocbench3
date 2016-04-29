import { Component, Injector, provide } from 'angular2/core';
import {Router} from 'angular2/router';
import {Modal, ICustomModal, ICustomModalComponent, ModalDialogInstance, ModalConfig} from 'angular2-modal/angular2-modal';
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {ARTURIResource} from "../../utils/ARTResources";
import {ModalServices} from "../../widget/modal/modalServices";
import {FilePickerComponent} from "../../widget/filePicker/filePickerComponent";
import {AlignmentCell} from "./AlignmentCell";
import {ValidationSettingsModal, ValidationSettingsModalContent} from "./validationSettingsModal/validationSettingsModal"
import {AlignmentServices} from "../../services/AlignmentServices";

@Component({
    selector: 'alignment-validation-component',
    templateUrl: 'app/src/alignment/alignmentValidation/alignmentValidationComponent.html',
    directives: [FilePickerComponent],
    providers: [AlignmentServices],
    host: { class: "pageComponent" }
})
export class AlignmentValidationComponent {
    
    private alignmentFile: File;
    private alignmentCellList: Array<AlignmentCell> = [];
    private sourceBaseURI: string;
    private targetBaseURI: string;
    
    private qaNull = "---";
    private qaAcceptAll = "Accept all";
    private qaAcceptAllAbove = "Accept all above threshold";
    private qaRejectAll = "Reject all";
    private qaRejectAllUnder = "Reject all under threshold";
    private quickActionList: Array<any> = [this.qaNull, this.qaAcceptAll, this.qaAcceptAllAbove, this.qaRejectAll, this.qaRejectAllUnder];
    private chosenQuickAction: any = this.quickActionList[0];
    private threshold: number = 0.0;
    
    private relationSymbols: Array<any> = [
        {relation: "=", dlSymbol: "\u2261", text: "equivalent"},
        {relation: ">", dlSymbol: "\u2292", text: "subsumes"},
        {relation: "<", dlSymbol: "\u2291", text: "is subsumed"},
        {relation: "%", dlSymbol: "\u22a5", text: "incompatible"},
        {relation: "HasInstance", dlSymbol: "\u2192", text: "has instance"},
        {relation: "InstanceOf", dlSymbol: "\u2190", text: "instance of"}
    ];

    
    constructor(private vbCtx: VocbenchCtx, private router: Router, private alignmentService: AlignmentServices,
        private modalService: ModalServices, private modal: Modal) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }

    ngOnDestroy() {
        //close session only if token is defined
        //(token is defined only when sessios is initialized once the alignment is loaded)
        if (this.vbCtx.getSessionToken() != undefined) {
            //close session server side
            this.alignmentService.closeSession().subscribe(
                stResp => {//and remove token client side
                    this.vbCtx.removeSessionToken();
                }
            );
        }
    }
    
    private fileChangeEvent(file: File) {
        this.alignmentFile = file;
    }
    
    private loadAlignment() {
        this.vbCtx.setSessionToken(this.generateSessionRandomToken());
        this.alignmentService.loadAlignment(this.alignmentFile).subscribe(
            alignedOnto => {
                this.sourceBaseURI = alignedOnto.onto1;
                this.targetBaseURI = alignedOnto.onto2;
                this.alignmentService.listCells().subscribe(
                    map => {
                        this.alignmentCellList = map.cells;
                    }
                );
            }
        );
    }
    
    private acceptAlignment(cell: AlignmentCell) {
        this.alignmentService.acceptAlignment(cell.getEntity1(), cell.getEntity2(), cell.getRelation()).subscribe(
            resultCell => {
                //replace the accepted alignment cell with the returned one
                this.alignmentCellList[this.getIndexOfCell(cell)] = resultCell;
            }
        )
    }
    
    private rejectAlignment(cell: AlignmentCell) {
        this.alignmentService.rejectAlignment(cell.getEntity1(), cell.getEntity2(), cell.getRelation()).subscribe(
            resultCell => {
                //replace the rejected alignment cell with the returned one
                this.alignmentCellList[this.getIndexOfCell(cell)] = resultCell;
            }
        )
    }
    
    private changeRelation(cell: AlignmentCell, relation: string) {
        //change relation only if user choses a relation different from the current
        if (cell.getRelation() != relation) {
            this.modalService.confirm("Change relation", 
                "Manually changing the relation will set automatically the measure of the alignment to 1.0. Do you want to continue?",
                "warning").then(
                confirm => {
                    this.alignmentService.changeRelation(cell.getEntity1(), cell.getEntity2(), relation).subscribe(
                        resultCell => {//replace the alignment cell with the new one
                            this.alignmentCellList[this.getIndexOfCell(cell)] = resultCell;
                        }
                    )
                },
                () => {}    
            )
        }
    }
    
    private getSuggestedMappingProperties(cell: AlignmentCell) {
        this.alignmentService.listSuggestedProperties(cell.getEntity1(), cell.getRelation()).subscribe(
            props => {
                cell.setSuggestedMappingProperties(props);
            }
        )
    }
    
    private changeMappingProperty(cell: AlignmentCell, property: ARTURIResource) {
        //change property only if the user choses a property different from the current.
        if (property.getURI() != cell.getMappingProperty().getURI()) {
            this.alignmentService.changeMappingProperty(cell.getEntity1(), cell.getEntity2(), property.getURI()).subscribe(
                resultCell => {//replace the alignment cell with the new one
                    this.alignmentCellList[this.getIndexOfCell(cell)] = resultCell;
                }
            );
        }
    }
    
    private openSettings() {
        this.openSettingsModal().then(() => {}, () => {}); //just catch the returned promises
    }
    
    private openSettingsModal() {
        var modalContent = new ValidationSettingsModalContent();
        let resolvedBindings = Injector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>ValidationSettingsModal,
                resolvedBindings,
                new ModalConfig(null, true, null, "modal-dialog")
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    private doQuickAction() {
        document.getElementById("blockDivFullScreen").style.display = "block";
        if (this.chosenQuickAction == this.qaAcceptAll) {
            this.alignmentService.acceptAllAlignment().subscribe(
                cells => {
                    this.updateAlignmentListAfterQuickAction(cells);
                    document.getElementById("blockDivFullScreen").style.display = "none";
                }
            )
        } else if (this.chosenQuickAction == this.qaAcceptAllAbove) {
            this.alignmentService.acceptAllAbove(this.threshold).subscribe(
                cells => {
                    this.updateAlignmentListAfterQuickAction(cells);
                    document.getElementById("blockDivFullScreen").style.display = "none";
                }
            )
        } else if (this.chosenQuickAction == this.qaRejectAll) {
            this.alignmentService.rejectAllAlignment().subscribe(
                cells => {
                    this.updateAlignmentListAfterQuickAction(cells);
                    document.getElementById("blockDivFullScreen").style.display = "none";
                }
            )
        } else if (this.chosenQuickAction == this.qaRejectAllUnder) {
            this.alignmentService.rejectAllUnder(this.threshold).subscribe(
                cells => {
                    this.updateAlignmentListAfterQuickAction(cells);
                    document.getElementById("blockDivFullScreen").style.display = "none";
                }
            )
        }
    }
    
    private updateAlignmentListAfterQuickAction(newAlignmentList: Array<AlignmentCell>) {
        for (var i = 0; i < newAlignmentList.length; i++) {
            this.alignmentCellList[this.getIndexOfCell(newAlignmentList[i])] = newAlignmentList[i];
        }
    }
    
    private applyToOnto() {
        //TODO get deleteReject from user choice
        var deleteReject: boolean;
        this.alignmentService.applyValidation(deleteReject).subscribe(
            report => {
                console.log("actions done " + JSON.stringify(report));
            }
        )
    }
    
    private export() {
        alert("export alignment");
        this.alignmentService.exportAlignment().subscribe(
            stResp => {
                var data = new Blob([stResp], {type: "octet/stream"});
                var exportLink = window.URL.createObjectURL(data);
                console.log("exportLink " + exportLink);
            },
            err => { }
        );
    }
    
    private generateSessionRandomToken() {
	    var result = '';
	    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = 0; i < 16; i++) {
            var idx = Math.round(Math.random() * (chars.length - 1));
            result = result + chars[idx];
        }
    	return result;
    }
    
    /**
     * Retrieves the index of the given cell from the alignmentList so that the cell can be changed and
     * changes on model reflect on view
     */
    private getIndexOfCell(cell: AlignmentCell): number {
        return this.alignmentCellList.findIndex(c => 
            c.getEntity1() == cell.getEntity1() && c.getEntity2() == cell.getEntity2());
    }
    
}