import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class ValidationReportModalContent {
    /**
     * @param report collection of object with entity1, entity2, property and action
     */
    constructor(public report) {}
}

@Component({
    selector: "validation-report-modal",
    templateUrl: "app/src/alignment/alignmentValidation/validationReportModal/validationReportModal.html",
})
export class ValidationReportModal implements ICustomModalComponent {
    
    dialog: ModalDialogInstance;
    context: ValidationReportModalContent;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <ValidationReportModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }
    
    ok(event) {
        event.stopPropagation();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
}