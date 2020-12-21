import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { ResourcesServices } from "../../../../services/resourcesServices";
import { VBRequestOptions } from "../../../../utils/HttpManager";
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext, VBContext } from "../../../../utils/VBContext";
import { ModalOptions, TextOrTranslation } from '../../Modals';
import { BrowsingModalServices } from "../browsingModalServices";
import { LexiconListModal } from "../lexiconListModal/lexiconListModal";

@Component({
    selector: "lexical-entry-list-modal",
    templateUrl: "./lexicalEntryListModal.html",
})
export class LexicalEntryListModal {
    @Input() title: string;
    @Input() lexicon: ARTURIResource;
    @Input() lexiconChangeable: boolean = false;
    @Input() editable: boolean = false;
    @Input() deletable: boolean = false;
    @Input() allowMultiselection: boolean = false;
    @Input() projectCtx: ProjectContext;

    activeLexicon: ARTURIResource;
    selectedEntry: ARTURIResource;
    checkedResources: ARTURIResource[] = [];

    multiselection: boolean = false;

    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private resourceService: ResourcesServices,
        private browsingModals: BrowsingModalServices,
        private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.activeLexicon = this.lexicon;
        if (this.activeLexicon == null) { //if no lexicon has been "forced", set the current active lexicon
            let activeLexiconProp = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().activeLexicon;
            if (activeLexiconProp != null) {
                this.resourceService.getResourceDescription(activeLexiconProp, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
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

    onLexiconSelected(entry: ARTURIResource) {
        this.selectedEntry = entry;
    }

    changeLexicon() {
        this.browsingModals.browseLexiconList({key:"ACTIONS.SELECT_LEXICON"}).then(
            (lexicon: ARTURIResource) => {
                this.activeLexicon = lexicon;
            },
            () => {}
        )
    }

    isOkEnabled() {
        if (this.multiselection) {
            return this.checkedResources.length > 0;
        } else {
            return this.selectedEntry != null;
        }
    }

    ok() {
        let returnValue: any = this.multiselection ? this.checkedResources : this.selectedEntry; //ARTURIResource or ARTURIResource (multiselection on)
        this.activeModal.close(returnValue);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}