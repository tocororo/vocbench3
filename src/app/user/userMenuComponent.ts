import {Component} from "@angular/core";
import {Router} from '@angular/router';
import {AuthServices} from "../services/authServices";
import {ModalServices} from "../widget/modal/modalServices";
import {VocbenchCtx} from "../utils/VocbenchCtx";
import {VBEventHandler} from "../utils/VBEventHandler";
import {User} from "../utils/User";

@Component({
    selector: "li[user-menu]", //what is this? used to avoid css style breaking (use <li user-menu ...></li>)
        //see http://stackoverflow.com/questions/34707029/angular-2-semantic-ui-component-encapsulation-breaks-style
    templateUrl: "./userMenuComponent.html",
})
export class UserMenuComponent {

    private currentUser: User;
    
    constructor(private router: Router, private vbCtx: VocbenchCtx, private evtHandler: VBEventHandler,
        private authService: AuthServices, private modalService: ModalServices) {}

    ngOnInit() {
        this.currentUser = this.vbCtx.getLoggedUser();
    }

    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        return this.vbCtx.getWorkingProject() != undefined;
    }

    /**
     * Returns true if the user is logged (an authentication token is stored)
     */
    private isUserLogged(): boolean {
        return this.vbCtx.isLoggedIn();
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
     
    /**
     * When user selects "content language" menu item. Opens the modal to change the content language.
     */
    private changeContentLang() {
        this.modalService.changeContentLang().then( confirmed => {}, canceled => {} );
    }
    
    /**
     * Determines the status of the checkbox in the "content language" menu item.
     */
    private isHumanReadable(): boolean {
        return this.vbCtx.getHumanReadable();
    }
    
    /**
     * Listener to click event of the human readable checkbox in the "content language" menu item.
     * Updates the humanReadable setting and emits a contentLangChangedEvent.
     * N.B. this method listens the click event, and NOT the change, because it needs to intercept the click on the menu item 
     * and stop the propagation to prevent to open ContentLangModal  
     */
    private switchHumanReadable(humanReadable: boolean, event: Event) {
        event.stopPropagation();
        this.vbCtx.setHumanReadable(humanReadable);
        if (humanReadable) {
            this.evtHandler.contentLangChangedEvent.emit(this.vbCtx.getContentLanguage());
        } else {
            this.evtHandler.contentLangChangedEvent.emit(null);
        }
    }
    
}