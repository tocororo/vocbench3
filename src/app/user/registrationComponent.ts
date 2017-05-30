import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { Countries } from "../models/LanguagesCountries";
import { UserForm } from "../models/User";
import { UserServices } from "../services/userServices";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "registration-component",
    templateUrl: "./registrationComponent.html",
    host: { class: "pageComponent" }
})
export class RegistrationComponent {

    private userForm: UserForm;

    constructor(private userService: UserServices, private router: Router, private basicModals: BasicModalServices) { }

    private submit() {
        //check all required parameter
        if (!this.userForm.email || 
            (!this.userForm.password || this.userForm.password.trim() == "") ||
            (!this.userForm.confirmedPassword || this.userForm.confirmedPassword.trim() == "") ||
            (!this.userForm.givenName || this.userForm.givenName.trim() == "") ||
            (!this.userForm.familyName || this.userForm.familyName.trim() == "")) {
            this.basicModals.alert("Invalid data", "Please fill all the required fields", "error");
            return;
        }
        //check email
        if (!UserForm.isValidEmail(this.userForm.email)) {
            this.basicModals.alert("Invalid data", "Please enter a valid e-mail address", "error");
            return;
        }
        //check password
        if (this.userForm.password != this.userForm.confirmedPassword) {
            this.basicModals.alert("Invalid data", "Password and confirmed password are different.", "error");
            return;
        }
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.userService.registerUser(this.userForm.email, this.userForm.password, this.userForm.givenName, this.userForm.familyName,
            this.userForm.birthday, this.userForm.gender, this.userForm.country, this.userForm.address, this.userForm.affiliation,
            this.userForm.url, this.userForm.phone).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert("Registration complete",
                    "Your account has been created and is now pending activation. After the system administrator accepts your request, " +
                    "it will be possible to login with your email (" + this.userForm.email + ") and the password you provided").then(
                    result => {
                        this.router.navigate(['/Home']);
                    }
                );
            }
        );
    }

}