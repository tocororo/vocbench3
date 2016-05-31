import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {Cookie} from "../utils/Cookie";
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
    selector: "vb-settings-component",
    templateUrl: "app/src/settings/vocbenchSettingsComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchSettingsComponent {
    
    private resViewMode: string;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        // navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        }        
    }
    
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