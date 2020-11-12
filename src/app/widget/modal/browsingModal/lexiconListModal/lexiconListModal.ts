import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

@Component({
    selector: "lexicon-list-modal",
    templateUrl: "./lexiconListModal.html",
})
export class LexiconListModal {
    @Input() title: string;
    @Input() projectCtx?: ProjectContext;
    
    selectedLexicon: ARTURIResource;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    onLexiconSelected(lexicon: ARTURIResource) {
        this.selectedLexicon = lexicon;
    }
    
    ok() {
        this.activeModal.close(this.selectedLexicon);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}