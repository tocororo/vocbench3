import {Component} from "@angular/core";
import {RouterLink, Router} from "@angular/router-deprecated";
import {VocbenchCtx} from "./utils/VocbenchCtx";

@Component({
    selector: "home-component",
    templateUrl: "app/src/homeComponent.html",
    directives: [RouterLink],
    host: { class : "pageComponent" }
})
export class HomeComponent {
    
    //login params
    private rememberMe: boolean = false;
    private email: string;
    private password: string;
    
    constructor(private router: Router, private vbCtx: VocbenchCtx) {}
    
    private login() {
        //here I should do an authentication request to server. In case of success, store the returned token and redirect to project
        console.log("Loggin in with email: " + this.email + " and password " + this.password + " and rememberMe " + this.rememberMe);
        this.vbCtx.setAuthenticationToken("simpleFakeTokenJustForTest");
        this.router.navigate(['Projects']);
    }
    
    private forgotPassword() {
        //TODO
        alert("Not yet available");
    }
    
}