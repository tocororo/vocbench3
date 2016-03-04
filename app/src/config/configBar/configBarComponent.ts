import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";
import {VocbenchCtx} from "../../utils/VocbenchCtx";

@Component({
	selector: "config-bar",
	templateUrl: "app/src/config/configBar/configBarComponent.html",
    directives: [ROUTER_DIRECTIVES],
})
export class ConfigBarComponent {
    
    constructor(private vbCtx: VocbenchCtx) {}
    
    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        return this.vbCtx.getProject() != undefined;
    }
    
}