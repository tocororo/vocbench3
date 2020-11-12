import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { ResourcesServices } from "../../../../services/resourcesServices";
import { VBRequestOptions } from "../../../../utils/HttpManager";
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext, VBContext } from "../../../../utils/VBContext";
import { ModalOptions } from '../../Modals';
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
        this.browseLexiconList("Select a Lexicon").then(
            (lexicon: ARTURIResource) => {
                this.activeLexicon = lexicon;
            },
            () => {}
        )
    }

    /**
     * Here I don't use the method browseLexiconList() of BrowsingModalService since injecting it here would cause a circular dependency.
     * (I'm not sure circular DI is the reason, but I cannot inject BrowsingModalService)
     */
    //TODO TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO check if now it is possible
    private browseLexiconList(title: string) {
        const modalRef: NgbModalRef = this.modalService.open(LexiconListModal, new ModalOptions());
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.projectCtx = this.projectCtx;
        return modalRef.result;
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