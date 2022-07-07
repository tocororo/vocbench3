import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Cookie } from "../../../utils/Cookie";

@Component({
    selector: "validation-settings-modal",
    templateUrl: "./validationSettingsModal.html",
})
export class ValidationSettingsModal {
    rejectedAlignmentAction: string;
    private rejectedOptAsk = { value: "ask", label: "Always ask (Always ask for the action to perform)" };
    private rejectedOptSkip = { value: "skip", label: "Always skip (Do not perform any action on the ontology)" };
    private rejectedOptDelete = { value: "delete", label: "Always delete (Remove, if present, the triple defined by the alignment)" };
    rejectedAlignmentOptions = [this.rejectedOptAsk, this.rejectedOptSkip, this.rejectedOptDelete];

    private showRelationType: string;
    private showRelOptRel = { value: "relation", label: "Alignment format relation (=, <;, >;, %,...)" };
    private showRelOptDl = { value: "dlSymbol", label: "Description Logic symbol (≡;, ⊑;, ⊒;, ⊥;,...)" };
    private showRelOptText = { value: "text", label: "Text (equivalent, is subsumed, subsumes, incompatible,...)" };
    showRelationOptions = [this.showRelOptRel, this.showRelOptDl, this.showRelOptText];

    confOnMeterCheck: boolean;
    maxAlignment: number;

    submitted: boolean = false;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        //here there's no need to check if cookies are != null, because they're initialized in AlignmentValidationComponent
        this.rejectedAlignmentAction = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION);
        this.showRelationType = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_RELATION_SHOW);
        this.confOnMeterCheck = Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_SHOW_CONFIDENCE) == "true";
        this.maxAlignment = +Cookie.getCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE);
    }

    ok() {
        this.submitted = true;
        if (this.maxAlignment < 1 || this.maxAlignment > 100) {
            return;
        }
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_REJECTED_ALIGNMENT_ACTION, this.rejectedAlignmentAction);
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_RELATION_SHOW, this.showRelationType);
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_SHOW_CONFIDENCE, this.confOnMeterCheck + "");
        Cookie.setCookie(Cookie.ALIGNMENT_VALIDATION_ALIGNMENT_PER_PAGE, this.maxAlignment + "");

        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }
}