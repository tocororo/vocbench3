import { Component, Input } from "@angular/core";
import { EntryReference, LexicalResourceUtils } from "src/app/models/LexicographerView";

@Component({
    selector: "entry-ref",
    templateUrl: "./entryReferenceComponent.html",
    host: { class: "d-block" }
})
export class EntryReferenceComponent {
    @Input() ref: EntryReference;

    renderingClass: string = "";

    constructor() { }

    ngOnInit() {
        this.initRenderingClass();
    }

    private initRenderingClass() {
        if (LexicalResourceUtils.isInStagingAdd(this.ref)) {
            this.renderingClass = "proposedAddRes";
        } else if (LexicalResourceUtils.isInStagingRemove(this.ref)) {
            this.renderingClass = "proposedRemoveRes";
        }
    }

}