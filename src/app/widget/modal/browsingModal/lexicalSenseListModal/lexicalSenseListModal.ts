import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectContext } from "src/app/utils/VBContext";
import { ARTResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

@Component({
    selector: "lexical-sense-list-modal",
    templateUrl: "./lexicalSenseListModal.html",
})
export class LexicalSenseListModal {
    @Input() title: string;
    @Input() projectCtx: ProjectContext;

    selectedSense: ARTResource;

    multiselection: boolean = false;

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    onSenseSelected(sense: ARTResource) {
        this.selectedSense = sense;
    }

    isOkEnabled() {
        return this.selectedSense != null;
    }

    ok() {
        this.activeModal.close(this.selectedSense);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}