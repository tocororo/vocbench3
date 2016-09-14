import {Component, Input} from "@angular/core";
import {ARTResource} from "../../utils/ARTResources";
import {Cookie} from "../../utils/Cookie";

@Component({
    selector: "resource-view-panel",
    templateUrl: "./resourceViewPanelComponent.html",
    host: { class: "resViewContainer" }
})
export class ResourceViewPanelComponent {
    
    @Input() resource: ARTResource;
    
    private resViewMode: string; //"splitted" or "tabbed";
    
    constructor() {}
    
    ngOnInit() {
        var rvModeCookie = Cookie.getCookie(Cookie.VB_RESOURCE_VIEW_MODE);
        if (rvModeCookie == "splitted" || rvModeCookie == "tabbed") {
            this.resViewMode = rvModeCookie;
        } else {
            this.resViewMode = "tabbed"; //default
        }
    }
    
}