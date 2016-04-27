import { Component, OnInit } from 'angular2/core';
import {Router} from 'angular2/router';
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {FilePickerComponent} from "../../widget/filePicker/filePickerComponent";
import {AlignmentCell} from "./AlignmentCell";
import {AlignmentServices} from "../../services/AlignmentServices";

@Component({
    selector: 'alignment-validation-component',
    templateUrl: 'app/src/alignment/alignmentValidation/alignmentValidationComponent.html',
    directives: [FilePickerComponent],
    providers: [AlignmentServices],
    host: { class: "pageComponent" }
})
export class AlignmentValidationComponent implements OnInit {
    
    private alignmentFile: File;
    private alignmentList: Array<AlignmentCell> = [];
    private sourceBaseURI: string;
    private targetBaseURI: string;
    
    // private qaNull: {value: "---", label: "---"};
    // private qaAcceptAll = {value: "acceptAll", label: "Accept all"};
    // private qaAcceptAllAbove = {value: "acceptAllAbove", label: "Accept all above threshold"};
    // private qaRejectAll = {value: "rejectAll", label: "Reject all"};
    // private qaRejectAllUnder = {value: "rejectAllUnder", label: "Reject all under threshold"};
    private qaNull = "---";
    private qaAcceptAll = "Accept all";
    private qaAcceptAllAbove = "Accept all above threshold";
    private qaRejectAll = "Reject all";
    private qaRejectAllUnder = "Reject all under threshold";
    private quickActionList: Array<any> = [this.qaNull, this.qaAcceptAll, this.qaAcceptAllAbove, this.qaRejectAll, this.qaRejectAllUnder];
    private chosenQuickAction: any = this.quickActionList[0];
    private threshold: number = 0.0;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router, private alignmentService: AlignmentServices) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }

    ngOnInit() {
        this.vbCtx.setSessionToken(this.generateSessionRandomToken());
    }
    
    ngOnDestroy() {
        this.vbCtx.removeSessionToken();
    }
    
    private fileChangeEvent(file: File) {
        this.alignmentFile = file;
    }
    
    private loadAlignment() {
        this.alignmentService.loadAlignment(this.alignmentFile).subscribe(
            alignedOnto => {
                this.sourceBaseURI = alignedOnto.onto1;
                this.targetBaseURI = alignedOnto.onto2;
                this.alignmentService.listCells().subscribe(
                    map => {
                        this.alignmentList = map.cells;
                    }
                );
            }
        );
    }
    
    private acceptAlignment(cell: AlignmentCell) {
        this.alignmentService.acceptAlignment(cell.getEntity1(), cell.getEntity2(), cell.getRelation()).subscribe(
            resultCell => {
                //replace the accepted alignment cell with the returned one
                this.alignmentList[this.getIndexOfCell(cell)] = resultCell;
            }
        )
    }
    
    private rejectAlignment(cell: AlignmentCell) {
        this.alignmentService.rejectAlignment(cell.getEntity1(), cell.getEntity2(), cell.getRelation()).subscribe(
            resultCell => {
                //replace the rejected alignment cell with the returned one
                this.alignmentList[this.getIndexOfCell(cell)] = resultCell;
            }
        )
    }
    
    private openSettings() {
        alert("opening dialog for settings");
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
            this.alignmentList[this.getIndexOfCell(newAlignmentList[i])] = newAlignmentList[i];
        }
    }
    
    private applyToOnto() {
        alert("apply alignment to ontology");
    }
    
    private export() {
        alert("export alignment");
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
        return this.alignmentList.findIndex(c => 
            c.getEntity1() == cell.getEntity1() && c.getEntity2() == cell.getEntity2() && c.getRelation() == cell.getRelation());
    }
    
}