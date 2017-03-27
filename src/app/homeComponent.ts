import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { VBContext } from "./utils/VBContext";

@Component({
    selector: "home-component",
    templateUrl: "./homeComponent.html",
    host: { class: "pageComponent" }
})
export class HomeComponent {

    constructor(private router: Router) { }

    private isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

}