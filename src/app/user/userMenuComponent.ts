import { Component } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { NotificationStatus } from "../models/Properties";
import { User } from "../models/User";
import { AuthServices } from "../services/authServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../utils/VBActions";
import { VBContext } from "../utils/VBContext";

@Component({
    // selector: "li[user-menu]", //what is this? used to avoid css style breaking (use <li user-menu ...></li>)
    selector: "ul[user-menu]", //what is this? used to avoid css style breaking (use <li user-menu ...></li>)
    //see http://stackoverflow.com/questions/34707029/angular-2-semantic-ui-component-encapsulation-breaks-style
    templateUrl: "./userMenuComponent.html",
})
export class UserMenuComponent {

    private currentUser: User;
    userShow: string;

    private imgSrcFallback: string = "../../assets/images/logos/user.svg";
    userAvatarUrl: SafeUrl;

    isProjectOpen: boolean;
    isAdministrationVisible: boolean;
    isNotificationsVisible: boolean;

    constructor(private authService: AuthServices, private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.currentUser = VBContext.getLoggedUser();
        this.userShow = this.currentUser.getShow();
        this.initBackgroundImgSrc();
    }

    /**
     * Listener when menu is clicked to open. Updates currentUser variable.
     * This is needed because the user in the context could have been changed from user profile page.
     */
    onMenuOpen() {
        this.currentUser = VBContext.getLoggedUser();
        this.initBackgroundImgSrc();

        this.isProjectOpen = VBContext.getWorkingProject() != undefined;

        //administration entry visible if logged user is the admin or if the logged user has permissions
        this.isAdministrationVisible = VBContext.getLoggedUser().isAdmin() || this.isProjectOpen && (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationRoleManagement) ||
            (
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationProjectManagement) &&
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserRoleManagement)
            )
        )

        //notifications entry visible if project open and the notifications are active
        this.isNotificationsVisible = false;
        if (this.isProjectOpen) {
            let noificationMode = VBContext.getWorkingProjectCtx().getProjectPreferences().notificationStatus;
            this.isNotificationsVisible = noificationMode == NotificationStatus.in_app_only || noificationMode == NotificationStatus.email_daily_digest;
        }
        
        

    }

    private initBackgroundImgSrc() {
        let avatarUrl = this.currentUser.getAvatarUrl();
        if (avatarUrl != null) {
            this.userAvatarUrl = this.sanitizer.bypassSecurityTrustResourceUrl(avatarUrl);
        } else {
            this.setFallbackImage();
        }
        
    }

    setFallbackImage() {
        this.userAvatarUrl = this.sanitizer.bypassSecurityTrustUrl(this.imgSrcFallback);
    }

    /**
     * Removes the authentication token and redirect to home page
     */
    logout() {
        this.authService.logout().subscribe();
    }

}