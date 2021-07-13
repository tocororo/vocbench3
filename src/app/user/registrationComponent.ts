import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ARTURIResource } from "../models/ARTResources";
import { UserForm } from "../models/User";
import { AdministrationServices } from "../services/administrationServices";
import { AuthServices } from "../services/authServices";
import { UserServices } from "../services/userServices";
import { UIUtils } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalType, Translation } from '../widget/modal/Modals';

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
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key:"MESSAGES.FILL_ALL_REQUIRED_FIELDS"}, ModalType.warning);
            return;
        }
        if (this.userForm.urlAsIri && (this.userForm.url == null || this.userForm.url.trim() == "")) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key:"MESSAGES.USER_IRI_PERSONAL_URL_INCONSISTENT"}, ModalType.warning);
            return
        }
        //check email
        if (!UserForm.isValidEmail(this.userForm.email)) {
            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.ENTER_VALID_EMAIL"}, ModalType.warning);
            return;
        }
        //check password
        if (this.userForm.password != this.userForm.confirmedPassword) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key:"MESSAGES.PASSWORD_AND_CONFIRMED_INCONSISTENT"}, ModalType.warning);
            return;
        }
        //check IRI
        if (this.userForm.urlAsIri && !UserForm.isIriValid(this.userForm.iri)) {
            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.ENTER_VALID_IRI"}, ModalType.warning);
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
            () => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                var message: Translation;
                if (this.firstAccess) {
                    message = {key:"MESSAGES.USER_ADMINISTRATOR_CREATED"};
                } else {
                    if (VBContext.getSystemSettings().emailVerification) {
                        //inform user that email verification is required
                        message = {key:"MESSAGES.USER_CREATED_VERIFY_EMAIL"};
                    } else {
                        //inform user that registration is completed and the account waits to be activated
                        message = {key:"MESSAGES.USER_CREATED_WAIT_ACTIVATION"};
                    }
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