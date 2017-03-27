import {Component, ViewContainerRef} from "@angular/core";
import {Overlay} from "angular2-modal";

import {VBContext} from "./utils/VBContext";

import '../assets/styles/style.css';

@Component({
    selector: "app",
    templateUrl: "./appComponent.html",
})

export class AppComponent {
    
    constructor(viewContainer: ViewContainerRef, overlay: Overlay) {
        /* A Default view container ref, usually the app root container ref.
         * Has to be set manually until we can find a way to get it automatically. */
        overlay.defaultViewContainer = viewContainer;
    }
    
    /**
     * Returns true if the user is logged (an authentication token is stored)
     * Useful to show/hide menubar link
     */
    private isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

    /**
     * returns true if a project is open. Useful to show/hide menubar links
     */ 
    private isProjectOpen(): boolean {
        return VBContext.getWorkingProject() != undefined;
    }
    
}