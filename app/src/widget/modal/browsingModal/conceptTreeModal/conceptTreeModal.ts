import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from '../../../../utils/ARTResources';
import {ConceptTreeComponent} from '../../../../skos/concept/conceptTree/conceptTreeComponent';

export class ConceptTreeModalContent {
    constructor(public title: string = 'Modal Title', public scheme: ARTURIResource) {}
}

@Component({
    selector: "concept-tree-modal",
    templateUrl: "app/src/widget/modal/browsingModal/conceptTreeModal/conceptTreeModal.html",
    directives: [ConceptTreeComponent]
})
export class ConceptTreeModal implements ICustomModalComponent {
    
    private selectedConcept;
    
    dialog: ModalDialogInstance;
    context: ConceptTreeModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <ConceptTreeModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
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