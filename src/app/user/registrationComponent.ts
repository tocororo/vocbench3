import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { Countries } from "../models/LanguagesCountries";
import { UserServices } from "../services/userServices";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "registration-component",
    templateUrl: "./registrationComponent.html",
    host: { class: "pageComponent" }
})
export class RegistrationComponent {

    private countries = Countries.countryList;

    private genders = ["Male", "Female"];

    private submitted: boolean = false;

    private email: string;
    private username: string;
    private password: string;
    private confirmedPassword: string;
    private firstName: string;
    private lastName: string;
    private birthday: Date;
    private gender: string;
    private country: string;
    private address: string;
    private affiliation: string;
    private url: string;
    private phone: string;

    private EMAIL_PATTERN = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";

    constructor(private userService: UserServices, private router: Router, private basicModals: BasicModalServices) { }

    private submit() {
        this.submitted = true;
        if (this.isDataValid()) {
            UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
            this.userService.registerUser(this.email, this.password, this.firstName, this.lastName,
                this.birthday, this.gender, this.country, this.address, this.affiliation, this.url, this.phone).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                    this.basicModals.alert("Registration complete",
                        "The request for registration has been sent and is now pending activation. " +
                        "After the system administrator accepts your request, it will be possible to login with your email " +
                        this.email + " and the password you provided").then(
                        result => {
                            this.router.navigate(['/Home']);
                        }
                    );
                },
                () => { UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen")); }
                )
        } else {
            this.basicModals.alert("Registration error", "Please, check the inserted data.", "warning");
        }
    }

    private isDataValid() {
        var emailValid = this.email && this.email.trim() != "" && new RegExp(this.EMAIL_PATTERN).test(this.email);
        // var usernameValid = this.username && this.username.trim() != "";
        var pwdValid = this.password && this.password.trim() != "" && this.isConfirmPwdOk();
        var firstLastNameValid = this.firstName && this.firstName.trim() != "" && this.lastName && this.lastName.trim() != "";
        return emailValid && pwdValid && firstLastNameValid;
    }

    /**
     * Used also in template to dynamically set class to password input text
     */
    private isConfirmPwdOk() {
        return this.password == this.confirmedPassword;
    }


}