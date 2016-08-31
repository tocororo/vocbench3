import {Component, ViewContainerRef} from "@angular/core";
import {Router} from '@angular/router';

import {VocbenchCtx} from "./utils/VocbenchCtx";
import {AuthServices} from "./auth/authServices";
import {VBEventHandler} from "./utils/VBEventHandler";
import {ConfigBarComponent} from "./config/configBar/configBarComponent";

//import to open modal to change content language (Remove if the modal will be launched from another component)
import {Overlay} from "angular2-modal"
import {Modal} from 'angular2-modal/plugins/bootstrap';
import {ContentLangModal, ContentLangModalData} from "./settings/contentLang/contentLangModal";

import {TestComponent} from "./test/testComponent";

@Component({
    selector: "app",
    templateUrl: "app/src/app.html",
    directives: [ConfigBarComponent],
})

export class App {
    
    constructor(private router: Router, private vbCtx: VocbenchCtx, private evtHandler: VBEventHandler,
        private authService: AuthServices, private modal: Modal, viewContainer: ViewContainerRef, overlay: Overlay) {
        /* A Default view container ref, usually the app root container ref.
         * Has to be set manually until we can find a way to get it automatically. */
        overlay.defaultViewContainer = viewContainer;
    }
    
    /**
     * Returns true if the user is logged (an authentication token is stored)
     */
    private isUserLogged(): boolean {
        return this.authService.isLoggedIn();
    }

    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        return this.vbCtx.getWorkingProject() != undefined;
    }
    
    /**
     * returns true if a project is SKOS or SKOS-XL. Useful to show/hide navbar links available only in SKOS (ex. concept, scheme)
     */
    private isProjectSKOS(): boolean {
        return (this.vbCtx.getWorkingProject().getPrettyPrintOntoType().indexOf("SKOS") > -1);
    }
    
    /**
     * returns true if a project is OWL. Useful to show/hide navbar links available only in OWL (ex. class)
     */
    private isProjectOWL(): boolean {
        return (this.vbCtx.getWorkingProject().getPrettyPrintOntoType() == "OWL");
    }
    
    
    //=================================
    //========= USER MENU BAR =========
    //=================================
    /*this logic cannot be moved in a dedicated (user menu) component since the component,
      would add an element (likely <user-menu>) between the <ul class="nav navbar-nav navbar-right"> and
      <li class="dropdown"> elements */

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
        this.modal.open(ContentLangModal, new ContentLangModalData()).then(
            dialog => {
                dialog.result.then( confirmed => {}, canceled => {} );
            }
        );
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