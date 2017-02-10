import { Component } from "@angular/core";
import { VocbenchCtx } from "../utils/VocbenchCtx";
import { UserServices } from "../services/userServices";
import { Countries } from "../models/LanguagesCountries";
import { User } from "../models/User";

@Component({
    selector: "user-profile-component",
    templateUrl: "./userProfileComponent.html",
    host: { class: "pageComponent" }
})
export class UserProfileComponent {

    private user: User;

    private genders = ["Male", "Female"];
    private countries = Countries.countryList;

    constructor(private vbCtx: VocbenchCtx, private userService: UserServices) { }

    ngOnInit() {
        this.user = this.vbCtx.getLoggedUser();
    }

    private updateFirstName(newFirstName: string) {
        this.userService.updateUserFirstName(this.user.getEmail(), newFirstName).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }

    private updateLastName(newLastName: string) {
        this.userService.updateUserLastName(this.user.getEmail(), newLastName).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }

    private updatePhone(newPhone: string) {
        this.userService.updateUserPhone(this.user.getEmail(), newPhone).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }

    private updateBirthday(newBirthday: Date) {
        this.userService.updateUserBirthday(this.user.getEmail(), newBirthday).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }

    private updateGender(newGender: string) {
        this.userService.updateUserGender(this.user.getEmail(), newGender).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }

    private updateCountry(newCountry: string) {
        this.userService.updateUserCountry(this.user.getEmail(), newCountry).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }

    private updateAddress(newAddress: string) {
        this.userService.updateUserAddress(this.user.getEmail(), newAddress).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }

    private updateAffiliation(newAffiliation: string) {
        this.userService.updateUserAffiliation(this.user.getEmail(), newAffiliation).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }

    private updateUrl(newUrl: string) {
        this.userService.updateUserUrl(this.user.getEmail(), newUrl).subscribe(
            user => {
                this.vbCtx.setLoggedUser(user);
            }
        )
    }


}