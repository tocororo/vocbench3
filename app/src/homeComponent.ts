import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {AuthServices} from "./auth/authServices";

@Component({
    selector: "home-component",
    templateUrl: "app/src/homeComponent.html",
    host: { class : "pageComponent" }
})
export class HomeComponent {
    
    //login params
    private rememberMe: boolean = false;
    private email: string;
    private password: string;
    
    constructor(private router: Router, private authService: AuthServices) {}
    
    private login() {
        //here I should do an authentication request to server. In case of success, store the returned token and redirect to project
        this.authService.login(this.email, this.password, this.rememberMe).subscribe(
            res => {
                if (this.authService.isLoggedIn()) {
                    this.router.navigate(['/Projects']);
                }
            }
        );
    }

    private forgotPassword() {
        alert("Not yet available"); //TODO
    }

    private isUserLogged(): boolean {
        return this.authService.isLoggedIn();
    }
    
}