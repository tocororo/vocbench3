import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {ModalServices} from "../widget/modal/modalServices";
import {Countries} from "../utils/LanguagesCountries";
import {UserServices} from "../services/userServices";

@Component({
    selector: "registration-component",
    templateUrl: "./registrationComponent.html",
    host: { class : "pageComponent" }
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
    
    constructor(private userService: UserServices, private router: Router, private modalService: ModalServices) {}
    
    private submit() {
        this.submitted = true;
        if (this.isDataValid()) {
            //call service
            console.log("email:", this.email, "\nusername", this.username, "\npassword", this.password, 
                "\nfirstName:", this.firstName, "\nlastName:", this.lastName, "\nbirthday:", this.birthday,
                "\ngender:", this.gender, "\ncountry:", this.country, "\naddress:", this.address,
                "\naffiliation:", this.affiliation, "\nurl:", this.url, "\nphone:", this.phone);
            this.userService.registerUser(this.email, this.password, this.firstName, this.lastName).subscribe(
                stResp => {
                    this.modalService.alert("Registration complete",
                        "User " + this.firstName + " " + this.lastName + " registered succesfully." +
                        " You can now login with your email (" + this.email + ") and the password you provided").then(
                            result => {
                                this.router.navigate(['/Home']);
                            }
                        );
                }
            )
        } else {
            this.modalService.alert("Registration error", "Please, check the inserted data.", "warning");
        }
    }

    private isDataValid() {
        var emailValid = this.email && this.email.trim() != "" && new RegExp(this.EMAIL_PATTERN).test(this.email);
        // var usernameValid = this.username && this.username.trim() != "";
        var pwdValid = this.password && this.password.trim() != "" && this.isConfirmPwdOk();
        var firstLastNameValid = this.firstName && this.firstName.trim() != "" && this.lastName && this.lastName.trim() != "";
        console.log("emailValid " + emailValid + ", pwdValid " + pwdValid + ", firstLastNameValid " + firstLastNameValid)
        return emailValid && pwdValid && firstLastNameValid;
    }

    /**
     * Used also in template to dynamically set class to password input text
     */
    private isConfirmPwdOk() {
        return this.password == this.confirmedPassword;
    }
    
    
}