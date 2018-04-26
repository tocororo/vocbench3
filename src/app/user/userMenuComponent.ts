import { Component } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { User } from "../models/User";
import { AuthServices } from "../services/authServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "li[user-menu]", //what is this? used to avoid css style breaking (use <li user-menu ...></li>)
    //see http://stackoverflow.com/questions/34707029/angular-2-semantic-ui-component-encapsulation-breaks-style
    templateUrl: "./userMenuComponent.html",
})
export class UserMenuComponent {

    private currentUser: User;

    private imgSrcFallback: string = require("../../assets/images/logos/user.svg");
    private userAvatarUrl: SafeUrl;

    constructor(private evtHandler: VBEventHandler, private authService: AuthServices, private basicModals: BasicModalServices,
        private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.currentUser = VBContext.getLoggedUser();
        this.initBackgroundImgSrc();
    }

    /**
     * Listener when menu is clicked to open. Updates currentUser variable.
     * This is needed because the user in the context could have been changed from user profile page.
     */
    private onMenuOpen() {
        this.currentUser = VBContext.getLoggedUser();
        this.initBackgroundImgSrc();
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
     * Determines whether the "Administration" menu item should be visible.
     * It is visible if the user is adminsitrator or if the user has capabilities of project manager for the current project
     */
    private isAdministrationVisible(): boolean {
        return (
            VBContext.getLoggedUser().isAdmin() ||
            this.isProjectOpen() && (
                AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ADMINISTRATION_ROLE_MANAGEMENT) ||
                (
                    AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ADMINISTRATION_PROJECT_MANAGEMENT) &&
                    AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ADMINISTRATION_USER_ROLE_MANAGEMENT)
                )
            )
        );
    }

    private initBackgroundImgSrc() {
        this.userAvatarUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.currentUser.getAvatarUrl());
    }

    private setFallbackImage() {
        this.userAvatarUrl = this.sanitizer.bypassSecurityTrustUrl(this.imgSrcFallback);
    }

    /**
     * Removes the authentication token and redirect to home page
     */
    private logout() {
        this.authService.logout().subscribe();
    }

}