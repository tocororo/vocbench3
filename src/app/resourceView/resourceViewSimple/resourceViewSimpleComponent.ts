import { Component, Input } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";

@Component({
    selector: "resource-view-simple",
    templateUrl: "./resourceViewSimpleComponent.html",
    host: { class: "vbox" }
})
export class ResourceViewSimpleComponent {

    @Input() resource: ARTResource;

    constructor() {}

    private refresh() {}

}