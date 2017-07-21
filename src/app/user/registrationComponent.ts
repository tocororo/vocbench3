import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { Countries } from "../models/LanguagesCountries";
import { UserForm } from "../models/User";
import { ARTURIResource } from "../models/ARTResources";
import { UserServices } from "../services/userServices";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "registration-component",
    templateUrl: "./registrationComponent.html",
    host: { class: "pageComponent" }
})
export class RegistrationComponent {

    private firstAccess: boolean = false;
    private userForm: UserForm;

    constructor(private userService: UserServices, private basicModals: BasicModalServices,
        private router: Router, private activeRoute: ActivatedRoute) { }

    ngOnInit() {
        // this.firstAccess = this.activeRoute.snapshot.data['user'] == null; //in case "resolve" is used
        this.firstAccess = this.activeRoute.snapshot.params['firstAccess'] == "1";
    }

    private fillDefaultUser() {
        this.userForm.givenName = "Admin";
        this.userForm.familyName = "Admin";
        this.userForm.email = "admin@vocbench.com";
        this.userForm.password = "admin";
        this.userForm.confirmedPassword = "admin";
    }

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
        if (this.userForm.urlAsIri && (this.userForm.url == null || this.userForm.url.trim() == "")) {
            this.basicModals.alert("Invalid data", "You checked the option to use the personal URL as user IRI, but the URL is not provided." + 
                " Please enter a valid URL or uncheck the above option", "error");
            return
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
        //check IRI
        if (this.userForm.urlAsIri && !UserForm.isIriValid(this.userForm.iri)) {
            this.basicModals.alert("Invalid data", "Please enter a valid IRI.", "error");
            return;
        }
        
        let userIri: ARTURIResource = null;
        if (this.userForm.iri != null) {
            userIri = new ARTURIResource(this.userForm.iri);
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.userService.registerUser(this.userForm.email, this.userForm.password, this.userForm.givenName, this.userForm.familyName, userIri,
            this.userForm.birthday, this.userForm.gender, this.userForm.country, this.userForm.address, this.userForm.affiliation,
            this.userForm.url, this.userForm.phone, this.userForm.languageProficiencies).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                var message: string;
                if (this.firstAccess) {
                    message = "The administration account has been created. " +
                        "It is now possible to login with the email (" + this.userForm.email + ") and the password you provided";
                } else {
                    message = "Your account has been created and is now pending activation. After the system administrator accepts your request, " +
                        "it will be possible to login with your email (" + this.userForm.email + ") and the password you provided";
                }
                this.basicModals.alert("Registration complete", message).then(
                    result => {
                        this.router.navigate(['/Home']);
                    }
                );
            }
        );
    }

}