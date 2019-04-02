import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

export class LexiconListModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "lexicon-list-modal",
    templateUrl: "./lexiconListModal.html",
})
export class LexiconListModal implements ModalComponent<LexiconListModalData> {
    context: LexiconListModalData;
    
    private selectedLexicon: ARTURIResource;
    
    constructor(public dialog: DialogRef<LexiconListModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedLexicon);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onLexiconSelected(lexicon: ARTURIResource) {
        this.selectedLexicon = lexicon;
    }

}