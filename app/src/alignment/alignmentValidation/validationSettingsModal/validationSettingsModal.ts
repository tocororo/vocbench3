import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class ValidationSettingsModalContent {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param resourceList resources available for the choise
     */
    // constructor(title: string,  message: string, resourceList: Array<ARTURIResource>) {
    //     this.title = title;
    //     this.message = message;
    //     this.resourceList = resourceList;
    // }
}

@Component({
    selector: "validation-settings-modal",
    templateUrl: "app/src/alignment/alignmentValidation/validationSettingsModal/validationSettingsModal.html",
})
export class ValidationSettingsModal implements ICustomModalComponent {
    
    private rejectedAlignmentAction: string;
    private rejectedOptAsk: string = "Always ask (Always ask for the action to perform)";
    private rejectedOptSkip: string = "Always skip (Do not perform any action on the ontology)";
    private rejectedOptDelete: string = "Always delete (Remove, if present, the triple defined by the alignment)";
    private rejectedAlignmentOptions = [this.rejectedOptAsk, this.rejectedOptSkip, this.rejectedOptDelete];
    
    private showRelation: string;
    private confOnMeterCheck: boolean;
    private maxAlignment: number;
    
    dialog: ModalDialogInstance;
    context: ValidationSettingsModalContent;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <ValidationSettingsModalContent>modelContentData;
    }
    
    ngOnInit() {
        //TODO this should be taken from cookie?
        this.rejectedAlignmentAction = this.rejectedAlignmentOptions[0];
        this.showRelation = "relation";
        this.confOnMeterCheck = false;
        this.maxAlignment = 15;
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