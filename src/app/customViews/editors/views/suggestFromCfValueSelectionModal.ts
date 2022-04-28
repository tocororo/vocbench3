import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomFormsServices } from 'src/app/services/customFormsServices';

@Component({
    selector: "suggest-cv-value-selection-modal",
    templateUrl: "./suggestFromCfValueSelectionModal.html",
})
export class SuggestFromCfValueSelectionModal {
    @Input() title: string;
    @Input() cfId: string;
    @Input() valueCandidates: string[];

    pearl: string;
    selectedCandidate: string;

    constructor(private customFormService: CustomFormsServices, private activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.selectedCandidate = this.valueCandidates[0];
        this.customFormService.getCustomForm(this.cfId).subscribe(
            cForm => {
                this.pearl = cForm.getRef();
            }
        );
    }

    ok() {
        this.activeModal.close(this.selectedCandidate);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}
