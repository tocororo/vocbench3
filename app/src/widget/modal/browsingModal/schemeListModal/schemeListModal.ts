import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from '../../../../utils/ARTResources';
import {SchemeListComponent} from '../../../../skos/scheme/schemeList/schemeListComponent';

export class SchemeListModalContent {
    constructor(public title: string = 'Modal Title') {}
}

@Component({
    selector: "scheme-list-modal",
    templateUrl: "app/src/widget/modal/browsingModal/schemeListModal/schemeListModal.html",
    directives: [SchemeListComponent]
})
export class SchemeListModal implements ICustomModalComponent {
    
    private selectedScheme;
    
    dialog: ModalDialogInstance;
    context: SchemeListModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <SchemeListModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedScheme);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onSchemeSelected(scheme: ARTURIResource) {
        this.selectedScheme = scheme;
    }

}