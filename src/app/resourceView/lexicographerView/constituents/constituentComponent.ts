import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTResource } from "src/app/models/ARTResources";
import { Constituent } from "src/app/models/LexicographerView";

@Component({
    selector: "constituent",
    templateUrl: "./constituentComponent.html",
    host: { class: "d-block" }
})
export class ConstituentComponent{
    @Input() readonly: boolean = false;
    @Input() constituent: Constituent;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update
    
    constructor() {}

    ngOnInit() {}

}