import { Component } from "@angular/core";
import { User } from "../models/User";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "user-profile-component",
    templateUrl: "./userProfileComponent.html",
    host: { class: "pageComponent" }
})
export class UserProfileComponent {

    user: User;

    constructor() { }

    ngOnInit() {
        this.user = VBContext.getLoggedUser();
    }

}