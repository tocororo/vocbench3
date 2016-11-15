import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {Cookie} from "../../../utils/Cookie";

/**
 * Useless class with empty data
 * (I need this cause currently I don't know how to create a Custom Modal without context data)
 */
export class ValidationSettingsModalData extends BSModalContext {
    constructor() {
        super();
        this.keyboard = null;
    }
}

@Component({
    selector: "validation-settings-modal",
    templateUrl: "./validationSettingsModal.html",
})
export class ValidationSettingsModal implements ModalComponent<ValidationSettingsModalData> {
    context: ValidationSettingsModalData;
    
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
    
    constructor(public dialog: DialogRef<ValidationSettingsModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        //here there's no need to check if cookies are != null, because they're initialized in AlignmentValidationComponent
        this.rejectedAlignmentAction = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION);
        this.showRelationType = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_RELATION_SHOW);
        this.confOnMeterCheck = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_SHOW_CONFIDENCE) == "true";
        this.maxAlignment = +Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE);
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