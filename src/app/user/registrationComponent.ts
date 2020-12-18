import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ARTURIResource } from "../models/ARTResources";
import { UserForm } from "../models/User";
import { AdministrationServices } from "../services/administrationServices";
import { AuthServices } from "../services/authServices";
import { UserServices } from "../services/userServices";
import { UIUtils } from "../utils/UIUtils";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalType } from '../widget/modal/Modals';

@Component({
    selector: "registration-component",
    templateUrl: "./registrationComponent.html",
    host: { class: "pageComponent" }
})
export class RegistrationComponent {

    firstAccess: boolean = false;
    privacyStatementAvailable: boolean = false;
    userForm: UserForm;

    constructor(private userService: UserServices, private administrationService: AdministrationServices, private authService: AuthServices,
        private vbProp: VBProperties, private basicModals: BasicModalServices, private router: Router, private activeRoute: ActivatedRoute) { }

    ngOnInit() {
        this.firstAccess = this.activeRoute.snapshot.params['firstAccess'] == "1";
        this.privacyStatementAvailable = this.vbProp.isPrivacyStatementAvailable();
    }

    fillDefaultUser() {
        this.userForm.givenName = "Admin";
        this.userForm.familyName = "Admin";
        this.userForm.email = "admin@vocbench.com";
        this.userForm.password = "admin";
        this.userForm.confirmedPassword = "admin";
    }

    submit() {
        //check all required parameter
        if (!this.userForm.email || 
            (!this.userForm.password || this.userForm.password.trim() == "") ||
            (!this.userForm.confirmedPassword || this.userForm.confirmedPassword.trim() == "") ||
            (!this.userForm.givenName || this.userForm.givenName.trim() == "") ||
            (!this.userForm.familyName || this.userForm.familyName.trim() == "")) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, "Please fill all the required fields", ModalType.warning);
            return;
        }
        if (this.userForm.urlAsIri && (this.userForm.url == null || this.userForm.url.trim() == "")) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, "You checked the option to use the personal URL as user IRI, but the URL is not provided." + 
                " Please enter a valid URL or uncheck the above option", ModalType.warning);
            return
        }
        //check email
        if (!UserForm.isValidEmail(this.userForm.email)) {
            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "Please enter a valid e-mail address", ModalType.warning);
            return;
        }
        //check password
        if (this.userForm.password != this.userForm.confirmedPassword) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, "Password and confirmed password are different.", ModalType.warning);
            return;
        }
        //check IRI
        if (this.userForm.urlAsIri && !UserForm.isIriValid(this.userForm.iri)) {
            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "Please enter a valid IRI.", ModalType.warning);
            return;
        }
        
        let userIri: ARTURIResource = null;
        if (this.userForm.iri != null) {
            userIri = new ARTURIResource(this.userForm.iri);
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.userService.registerUser(this.userForm.email, this.userForm.password, this.userForm.givenName, this.userForm.familyName, userIri,
            this.userForm.address, this.userForm.affiliation, this.userForm.url, this.userForm.avatarUrl, this.userForm.phone,
            this.userForm.languageProficiencies, this.userForm.customProperties).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                var message: string;
                if (this.firstAccess) {
                    message = "The administrator account has been created. " +
                        "Now you will be automatically logged in with the email (" + this.userForm.email + ") and the password you provided";
                } else {
                    message = "Your account has been created and is now pending activation. After the system administrator accepts your request, " +
                        "it will be possible to login with your email (" + this.userForm.email + ") and the password you provided";
                }
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, message).then(
                    result => {
                        if (this.firstAccess) {
                            this.authService.login(this.userForm.email, this.userForm.password).subscribe(
                                () => {
                                    this.router.navigate(["/Sysconfig"]);
                                }
                            );
                        } else {
                            this.router.navigate(['/Home']);
                        }
                    }
                );
            }
        );
    }

    private downloadPrivacyStatement() {
        this.administrationService.downloadPrivacyStatement().subscribe();
    }

}