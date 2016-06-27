import {Component} from "@angular/core";
import {Cookie} from "../utils/Cookie";

@Component({
    selector: "vb-settings-component",
    templateUrl: "app/src/settings/vocbenchSettingsComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchSettingsComponent {
    
    private resViewMode: string;
    
    ngOnInit() {
        var rvModeCookie = Cookie.getCookie(Cookie.VB_RESOURCE_VIEW_MODE);
        if (rvModeCookie == "splitted" || rvModeCookie == "tabbed") {
            this.resViewMode = rvModeCookie;
        } else {
            this.resViewMode = "tabbed"; //default
        }
    }
    
    private onResViewModeChanged() {
        //currently this is saved as cookie, in the future this will be linked to the user
        Cookie.setCookie(Cookie.VB_RESOURCE_VIEW_MODE, this.resViewMode);
    }
    
    
}