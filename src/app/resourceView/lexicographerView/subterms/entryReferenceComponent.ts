import { Component, Input } from "@angular/core";
import { EntryReference, LexicalResourceUtils } from "src/app/models/LexicographerView";

@Component({
    selector: "entry-ref",
    templateUrl: "./entryReferenceComponent.html",
    host: { class: "d-block" },
    styles: [`.entryRef { padding: 1px 2px; border-radius: 3px; }`]
})
export class EntryReferenceComponent {
    @Input() ref: EntryReference;

    renderingClass: string = "entryRef";

    constructor() { }

    ngOnInit() {
        this.initRenderingClass();
    }

    private initRenderingClass() {
        if (LexicalResourceUtils.isInStagingAdd(this.ref)) {
            this.renderingClass += " proposedAddRes";
        } else if (LexicalResourceUtils.isInStagingRemove(this.ref)) {
            this.renderingClass += " proposedRemoveRes";
        }
        if (LexicalResourceUtils.isTripleInStagingAdd(this.ref)) {
            this.renderingClass += " proposedAddTriple";
        } else if (LexicalResourceUtils.isTripleInStagingRemove(this.ref)) {
            this.renderingClass += " proposedRemoveTriple";
        }
    }

}