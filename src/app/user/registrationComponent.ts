import {Component} from "@angular/core";
import {ModalServices} from "../widget/modal/modalServices";
import {Countries} from "../utils/LanguagesCountries";

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
    
    constructor(private modalService: ModalServices) {}
    
    private isConfirmPwdOk(): boolean {
        return this.password == this.confirmedPassword;
    }
    
    private submit() {
        this.submitted = true;
        if (this.email && this.email.trim() != "" && new RegExp(this.EMAIL_PATTERN).test(this.email) &&
            this.username && this.username.trim() != "" && this.password && this.password.trim() != "" && this.isConfirmPwdOk() &&
            this.firstName && this.firstName.trim() != "" && this.lastName && this.lastName.trim() != "") {
            //call service
            console.log("email:", this.email, "\nusername", this.username, "\npassword", this.password, 
                "\nfirstName:", this.firstName, "\nlastName:", this.lastName, "\nbirthday:", this.birthday,
                "\ngender:", this.gender, "\ncountry:", this.country, "\naddress:", this.address,
                "\naffiliation:", this.affiliation, "\nurl:", this.url, "\nphone:", this.phone);
        } else {
            this.modalService.alert("Registration error", "Please, check the inserted data.", "warning");
        }
    }
    
    
}