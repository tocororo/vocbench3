import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

export class ConceptTreeModalData extends BSModalContext {
    /**
     * @param title the title of the modal
     * @param scheme the scheme of the concept tree. If not provided the modal contains a tree in no-scheme mode
     * @param schemeChangeable if true a menu is shown and the user can browse not only the selected scheme
     */
    constructor(
        public title: string = 'Modal Title',
        public schemes: ARTURIResource[],
        public schemeChangeable: boolean = false,
        public projectCtx?: ProjectContext
    ) {
        super();
    }
}

@Component({
    selector: "concept-tree-modal",
    templateUrl: "./conceptTreeModal.html",
})
export class ConceptTreeModal implements ModalComponent<ConceptTreeModalData> {
    context: ConceptTreeModalData;
    
    private selectedConcept: ARTURIResource;
    
    constructor(public dialog: DialogRef<ConceptTreeModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedConcept);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onConceptSelected(concept: ARTURIResource) {
        this.selectedConcept = concept;
    }

}