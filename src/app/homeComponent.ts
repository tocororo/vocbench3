import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {VocbenchCtx} from "./utils/VocbenchCtx";

@Component({
    selector: "home-component",
    templateUrl: "./homeComponent.html",
    host: { class : "pageComponent" }
})
export class HomeComponent {
    
    constructor(private router: Router, private vbCtx: VocbenchCtx) {}
    
    private isUserLogged(): boolean {
        return this.vbCtx.isLoggedIn();
    }
    
}