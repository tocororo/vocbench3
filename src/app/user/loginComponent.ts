import { Component, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { AuthServices } from "../services/authServices";
import { UserServices } from "../services/userServices";
import { ModalServices } from "../widget/modal/modalServices";
import { VBContext } from "../utils/VBContext";
import { User } from "../models/User";

@Component({
    selector: "login",
    templateUrl: "./loginComponent.html",
})
export class LoginComponent {

    @Output() loggedIn: EventEmitter<User> = new EventEmitter();

    private rememberMe: boolean = false;
    private email: string = "admin@vocbench.com";
    private password: string = "admin";

    constructor(private router: Router, private authService: AuthServices, private userService: UserServices,
        private modalService: ModalServices) { }

    ngOnInit() {
        this.userService.getUser().subscribe(
            user => {
                if (user) {
                    VBContext.setLoggedUser(user);
                }
            }
        )
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            this.login();
        }
    }

    private login() {
        this.authService.login(this.email, this.password, this.rememberMe).subscribe(
            user => {
                if (VBContext.isLoggedIn()) {
                    this.loggedIn.emit();
                }
            }
            //wrong login is already handled in HttpManager#handleError 
        );
    }

    private forgotPassword() {
        alert("Not yet available"); //TODO
    }

}