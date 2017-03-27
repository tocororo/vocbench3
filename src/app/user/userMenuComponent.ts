import {Component} from "@angular/core";
import {Router} from '@angular/router';
import {AuthServices} from "../services/authServices";
import {ModalServices} from "../widget/modal/modalServices";
import {VBContext} from "../utils/VBContext";
import {VBEventHandler} from "../utils/VBEventHandler";
import {User} from "../models/User";

@Component({
    selector: "li[user-menu]", //what is this? used to avoid css style breaking (use <li user-menu ...></li>)
        //see http://stackoverflow.com/questions/34707029/angular-2-semantic-ui-component-encapsulation-breaks-style
    templateUrl: "./userMenuComponent.html",
})
export class UserMenuComponent {

    private currentUser: User;
    
    constructor(private router: Router, private evtHandler: VBEventHandler,
        private authService: AuthServices, private modalService: ModalServices) {}

    ngOnInit() {
        this.currentUser = VBContext.getLoggedUser();
    }

    /**
     * Listener when menu is clicked to open. Updates currentUser variable.
     * This is needed because the user in the context could have been changed from user profile page.
     */
    private onMenuOpen() {
        this.currentUser = VBContext.getLoggedUser();
    }

    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        return VBContext.getWorkingProject() != undefined;
    }

    /**
     * Returns true if the user is logged (an authentication token is stored)
     */
    private isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

    /**
     * Removes the authentication token and redirect to home page
     */
    private logout() {
        this.authService.logout().subscribe(
            res => {
                this.router.navigate(["/Home"]);
            }
        );
    }
     
}