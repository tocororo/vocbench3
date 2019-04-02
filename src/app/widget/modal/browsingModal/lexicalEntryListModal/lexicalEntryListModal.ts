import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { ResourcesServices } from "../../../../services/resourcesServices";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBProperties } from "../../../../utils/VBProperties";
import { LexiconListModal, LexiconListModalData } from "../lexiconListModal/lexiconListModal";

export class LexicalEntryListModalData extends BSModalContext {
    constructor(
        public title: string = 'Modal Title',
        public lexicon: ARTURIResource,
        public lexiconChangeable: boolean = false,
        public editable: boolean = false,
        public deletable: boolean = false,
        public allowMultiselection: boolean = false
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
    private checkedResources: ARTURIResource[] = [];

    private multiselection: boolean = false;

    constructor(public dialog: DialogRef<LexicalEntryListModalData>, private modal: Modal, private resourceService: ResourcesServices,
        private vbProp: VBProperties, private elementRef: ElementRef) {
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

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(LexiconListModal, overlayConfig).result;
    }

    private isOkEnabled() {
        if (this.multiselection) {
            return this.checkedResources.length > 0;
        } else {
            return this.selectedEntry != null;
        }
    }

    ok(event: Event) {
        let returnValue: any = this.multiselection ? this.checkedResources : this.selectedEntry; //ARTURIResource or ARTURIResource (multiselection on)
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(returnValue);
    }

    cancel() {
        this.dialog.dismiss();
    }

}