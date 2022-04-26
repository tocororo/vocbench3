import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { STProperties } from 'src/app/models/Plugins';

@Component({
    selector: "conflict-resolver-modal",
    templateUrl: "./conflictResolverModal.html",
})
export class ConflictResolverModal {

    @Input() conflicts: ImportedMetadataConflict[];

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.conflicts.forEach(c => { c.choice = "override"; });
    }

    ok() {
        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export interface ImportedMetadataConflict {
    old: STProperties;
    new: STProperties;
    choice?: "keep" | "override";
}