import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {Cookie} from "../../../utils/Cookie";

/**
 * This modal doesn't get any input parameter, anyway provide this class cause I don't know at the moment how to
 * use custom modal without content
 */
export class ValidationSettingsModalContent {
    /**
     * @param
     */
    // constructor() {
    // }
}

@Component({
    selector: "validation-settings-modal",
    templateUrl: "app/src/alignment/alignmentValidation/validationSettingsModal/validationSettingsModal.html",
})
export class ValidationSettingsModal implements ICustomModalComponent {
    
    private rejectedAlignmentAction: string;
    private rejectedOptAsk = {value: "ask", label: "Always ask (Always ask for the action to perform)"};
    private rejectedOptSkip = {value: "skip", label: "Always skip (Do not perform any action on the ontology)"};
    private rejectedOptDelete = {value: "delete", label: "Always delete (Remove, if present, the triple defined by the alignment)"};
    private rejectedAlignmentOptions = [this.rejectedOptAsk, this.rejectedOptSkip, this.rejectedOptDelete];
    
    private showRelationType: string;
    private showRelOptRel = {value: "relation", label: "Alignment format relation (=, <;, >;, %,...)"};
    private showRelOptDl = {value: "dlSymbol", label: "Description Logic symbol (≡;, ⊑;, ⊒;, ⊥;,...)"};
    private showRelOptText = {value: "text", label: "Text (equivalent, is subsumed, subsumes, incompatible,...)"};
    private showRelationOptions = [this.showRelOptRel, this.showRelOptDl,this.showRelOptText];
    
    private confOnMeterCheck: boolean;
    private maxAlignment: number;
    
    private submitted: boolean = false;
    
    dialog: ModalDialogInstance;
    context: ValidationSettingsModalContent;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <ValidationSettingsModalContent>modelContentData;
    }
    
    ngOnInit() {
        //here there's no need to check if cookies are != null, because they're initialized in AlignmentValidationComponent
        this.rejectedAlignmentAction = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION);
        this.showRelationType = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_RELATION_SHOW);
        this.confOnMeterCheck = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_SHOW_CONFIDENCE) == "true";
        this.maxAlignment = +Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE);
        
        document.getElementById("toFocus").focus();
    }
    
    ok(event) {
        this.submitted = true;
        if (this.maxAlignment < 1 || this.maxAlignment > 100) {
            return;
        }
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION, this.rejectedAlignmentAction, 365*10);
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_RELATION_SHOW, this.showRelationType, 365*10);
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_SHOW_CONFIDENCE, this.confOnMeterCheck + "", 365*10);
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE, this.maxAlignment + "", 365*10);
        
        event.stopPropagation();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
}