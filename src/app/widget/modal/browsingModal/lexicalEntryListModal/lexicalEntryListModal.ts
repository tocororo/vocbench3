import { Component } from "@angular/core";
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent, OverlayConfig } from "ngx-modialog";
import { LexiconListModalData, LexiconListModal } from "../lexiconListModal/lexiconListModal";
import { VBProperties } from "../../../../utils/VBProperties";
import { ARTURIResource } from '../../../../models/ARTResources';
import { ResourcesServices } from "../../../../services/resourcesServices";

export class LexicalEntryListModalData extends BSModalContext {
    constructor(
        public title: string = 'Modal Title',
        public lexicon: ARTURIResource,
        public lexiconChangeable: boolean = false
    ) {
        super();
    }
}

@Component({
    selector: "lexical-entry-list-modal",
    templateUrl: "./lexicalEntryListModal.html",
})
export class LexicalEntryListModal implements ModalComponent<LexicalEntryListModalData> {
    context: LexicalEntryListModalData;

    private activeLexicon: ARTURIResource;
    private selectedEntry: ARTURIResource;

    constructor(public dialog: DialogRef<LexicalEntryListModalData>, private modal: Modal, private resourceService: ResourcesServices,
        private vbProp: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.activeLexicon = this.context.lexicon;
        if (this.activeLexicon == null) { //if no lexicon has been "forced", set the current active lexicon
            let activeLexiconProp = this.vbProp.getActiveLexicon();
            if (activeLexiconProp != null) {
                this.resourceService.getResourceDescription(activeLexiconProp).subscribe(
                    lex => {
                        this.activeLexicon = <ARTURIResource>lex;
                    }
                )
            }
        }
    }

    private onLexiconSelected(entry: ARTURIResource) {
        this.selectedEntry = entry;
    }

    private changeLexicon() {
        this.browseLexiconList("Select a Lexicon").then(
            (lexicon: ARTURIResource) => {
                this.activeLexicon = lexicon;
            },
            () => {}
        )
    }

    /**
     * Here I don't use the method browseLexiconList() of BrowsingModalService since injecting it here would cause a circular dependency.
     * (I'm not sure circular DI is the reasong, but I cannot inject BrowsingModalService)
     */
    private browseLexiconList(title: string) {
        var modalData = new LexiconListModalData(title);
        const builder = new BSModalContextBuilder<LexiconListModalData>(
            modalData, undefined, LexiconListModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(LexiconListModal, overlayConfig).result;
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedEntry);
    }

    cancel() {
        this.dialog.dismiss();
    }

}