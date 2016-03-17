import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from '../../../../utils/ARTResources';
import {ClassTreeComponent} from '../../../../owl/classTree/classTreeComponent';

export class ClassTreeModalContent {
    constructor(public title: string = 'Modal Title') {}
}

@Component({
    selector: "class-tree-modal",
    templateUrl: "app/src/widget/modal/browsingModal/classTreeModal/classTreeModal.html",
    directives: [ClassTreeComponent]
})
export class ClassTreeModal implements ICustomModalComponent {
    
    private selectedClass;
    
    dialog: ModalDialogInstance;
    context: ClassTreeModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <ClassTreeModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedClass);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onClassSelected(cls: ARTURIResource) {
        this.selectedClass = cls;
    }

}