import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import {ARTURIResource} from '../../../../models/ARTResources';

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
    
    constructor(public dialog: DialogRef<LexiconListModalData>) {
        this.context = dialog.context;
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