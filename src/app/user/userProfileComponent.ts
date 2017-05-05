import { Component } from "@angular/core";
import { VBContext } from "../utils/VBContext";
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

    private countries = Countries.countryList;

    constructor(private userService: UserServices) { }

    ngOnInit() {
        this.user = VBContext.getLoggedUser();
    }

    private updateGivenName(newGivenName: string) {
        this.userService.updateUserGivenName(this.user.getEmail(), newGivenName).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateFamilyName(newFamilyName: string) {
        this.userService.updateUserFamilyName(this.user.getEmail(), newFamilyName).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updatePhone(newPhone: string) {
        this.userService.updateUserPhone(this.user.getEmail(), newPhone).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateBirthday(newBirthday: Date) {
        this.userService.updateUserBirthday(this.user.getEmail(), newBirthday).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateGender(newGender: string) {
        this.userService.updateUserGender(this.user.getEmail(), newGender).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateCountry(newCountry: string) {
        this.userService.updateUserCountry(this.user.getEmail(), newCountry).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateAddress(newAddress: string) {
        this.userService.updateUserAddress(this.user.getEmail(), newAddress).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateAffiliation(newAffiliation: string) {
        this.userService.updateUserAffiliation(this.user.getEmail(), newAffiliation).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateUrl(newUrl: string) {
        this.userService.updateUserUrl(this.user.getEmail(), newUrl).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }


}