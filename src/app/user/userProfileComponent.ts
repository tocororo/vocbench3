import {Component} from "@angular/core";

import {VocbenchCtx} from "../utils/VocbenchCtx";
import {UserServices} from "../services/userServices";
import {User} from "../utils/User";

@Component({
    selector: "user-profile-component",
    templateUrl: "./userProfileComponent.html",
    host: { class : "pageComponent" }
})
export class UserProfileComponent {

    private user: User;
    
    constructor(private vbCtx: VocbenchCtx, private userService: UserServices) {}

    ngOnInit() {
        this.user = this.vbCtx.getLoggedUser();
    }

    private testAdmin() {
        this.userService.testRequiredAdmin().subscribe(
            stResp => {
                console.log("stResp " + JSON.stringify(stResp));
            }
        )
    }

}