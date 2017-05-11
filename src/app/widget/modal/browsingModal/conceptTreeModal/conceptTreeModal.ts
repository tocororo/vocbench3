import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource} from '../../../../models/ARTResources';

export class ConceptTreeModalData extends BSModalContext {
    /**
     * @param title the title of the modal
     * @param scheme the scheme of the concept tree. If not provided the modal contains a tree in no-scheme mode
     * @param schemeChangeable if true a menu is shown and the user can browse not only the selected scheme
     */
    constructor(
        public title: string = 'Modal Title',
        public schemes: ARTURIResource[],
        public schemeChangeable: boolean = false
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
    
    constructor(public dialog: DialogRef<ConceptTreeModalData>) {
        this.context = dialog.context;
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