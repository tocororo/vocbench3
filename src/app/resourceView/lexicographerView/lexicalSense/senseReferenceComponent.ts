import { Component, Input } from "@angular/core";
import { SenseReference } from "src/app/models/LexicographerView";

@Component({
    selector: "sense-ref",
    templateUrl: "./senseReferenceComponent.html",
    host: { class: "d-block" }
})
export class SenseReferenceComponent {
    @Input() ref: SenseReference;

    constructor() {}

    ngOnInit() {}

}