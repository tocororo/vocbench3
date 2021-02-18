import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource } from "src/app/models/ARTResources";
import { Constituent, LexicalEntry } from "src/app/models/LexicographerView";
import { LexViewHelper } from "../LexViewHelper";

@Component({
    selector: "constituent-list",
    templateUrl: "./constituentListComponent.html",
    host: { class: "d-block" }
})
export class ConstituentListComponent {
    @Input() readonly: boolean = false;
    @Input() entry: LexicalEntry;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update
    
    constituents: Constituent[];

    constructor(private lexViewHelper: LexViewHelper) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['entry']) {
            this.constituents = this.entry.constituents;
        }
    }

    edit() {
        this.lexViewHelper.setConstituents(this.entry.id).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    resourceDblClick(res: ARTResource) {
        this.dblclickObj.emit(res);
    }

    onUpdate() {
        this.update.emit();
    }

}