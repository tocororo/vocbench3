import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from '../../../../utils/ARTResources';
import {PropertyTreeComponent} from '../../../../property/propertyTree/propertyTreeComponent';

export class PropertyTreeModalContent {
    constructor(public title: string = 'Modal Title') {}
}

@Component({
    selector: "class-tree-modal",
    templateUrl: "app/src/widget/modal/browsingModal/propertyTreeModal/propertyTreeModal.html",
    directives: [PropertyTreeComponent]
})
export class PropertyTreeModal implements ICustomModalComponent {
    
    private selectedProperty;
    
    dialog: ModalDialogInstance;
    context: PropertyTreeModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <PropertyTreeModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedProperty);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onPropertySelected(property: ARTURIResource) {
        this.selectedProperty = property;
    }

}