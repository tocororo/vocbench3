import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {AuthServices} from "../services/authServices";
import {UserServices} from "../services/userServices";
import {ModalServices} from "../widget/modal/modalServices";
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
    selector: "login",
    templateUrl: "./loginComponent.html",
})
export class LoginComponent {
    
    private rememberMe: boolean = false;
    private email: string = "admin@admin.com";
    private password: string = "admin";
    
    constructor(private router: Router, private authService: AuthServices, private userService: UserServices,
        private modalService: ModalServices, private vbCtx: VocbenchCtx) {}

    ngOnInit() {
        this.userService.getUser().subscribe(
            user => {
                if (user) {
                    this.vbCtx.setLoggedUser(user);
                }
            }
        )
    }
    
    private login() {
        //here I should do an authentication request to server. In case of success, store the returned token and redirect to project
        this.authService.login(this.email, this.password, this.rememberMe).subscribe(
            res => {
                if (this.vbCtx.isLoggedIn()) {
                    this.router.navigate(['/Projects']);
                }
            }
            //wrong login is already handled in HttpManager#handleError 
        );
    }

    private forgotPassword() {
        alert("Not yet available"); //TODO
    }

}