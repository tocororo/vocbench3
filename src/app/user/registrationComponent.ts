import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ARTURIResource } from "../models/ARTResources";
import { AuthServiceMode } from "../models/Properties";
import { UserForm } from "../models/User";
import { AdministrationServices } from "../services/administrationServices";
import { AuthServices } from "../services/authServices";
import { UserServices } from "../services/userServices";
import { UIUtils } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalType, Translation } from '../widget/modal/Modals';
import { UserConstraint } from "./userCreateComponent";

@Component({
    selector: "registration-component",
    templateUrl: "./registrationComponent.html",
    host: { class: "pageComponent" }
})
export class RegistrationComponent {

    authServMode: AuthServiceMode;

    firstAccess: boolean = false;
    privacyStatementAvailable: boolean = false;
    userForm: UserForm;
    constraintUser: UserConstraint;

    constructor(private userService: UserServices, private administrationService: AdministrationServices, private authService: AuthServices,
        private vbProp: VBProperties, private basicModals: BasicModalServices, private router: Router, private activeRoute: ActivatedRoute) { }

    ngOnInit() {

        this.firstAccess = this.activeRoute.snapshot.params['firstAccess'] == "1";

        this.authServMode = VBContext.getSystemSettings().authService;
        if (this.authServMode == AuthServiceMode.EULogin) {
            let constraintEmail = this.activeRoute.snapshot.queryParams['email'];
            if (constraintEmail) {
                let constraintGivenName = this.activeRoute.snapshot.queryParams['givenName'];
                let constraintFamilyName = this.activeRoute.snapshot.queryParams['familyName'];
                this.constraintUser = {email: constraintEmail, givenName: constraintGivenName, familyName: constraintFamilyName};
            } else { //data about the EULogin user are not provided. Probably the page has been accessed manually. Redirect to Home
                this.router.navigate(["/Home"]);
            }
        }

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
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "MESSAGES.FILL_ALL_REQUIRED_FIELDS" }, ModalType.warning);
            return;
        }
        if (this.userForm.urlAsIri && (this.userForm.url == null || this.userForm.url.trim() == "")) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "MESSAGES.USER_IRI_PERSONAL_URL_INCONSISTENT" }, ModalType.warning);
            return
        }
        //check email
        if (!UserForm.isValidEmail(this.userForm.email)) {
            this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.ENTER_VALID_EMAIL" }, ModalType.warning);
            return;
        }
        //check password
        if (this.userForm.password != this.userForm.confirmedPassword) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "MESSAGES.PASSWORD_AND_CONFIRMED_INCONSISTENT" }, ModalType.warning);
            return;
        }
        //check IRI
        if (this.userForm.urlAsIri && !UserForm.isIriValid(this.userForm.iri)) {
            this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.ENTER_VALID_IRI" }, ModalType.warning);
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
                let message: Translation;
                if (this.firstAccess) {
                    message = {key:"MESSAGES.USER_ADMINISTRATOR_CREATED"};
                } else {
                    if (VBContext.getSystemSettings().emailVerification && this.authServMode == AuthServiceMode.Default) {
                        //inform user that email verification is required
                        message = {key:"MESSAGES.USER_CREATED_VERIFY_EMAIL"};
                    } else {
                        //inform user that registration is completed and the account waits to be activated
                        message = {key:"MESSAGES.USER_CREATED_WAIT_ACTIVATION"};
                    }
                }
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, message).then(
                    () => {
                        if (this.firstAccess) {
                            //in case first access, the admin has been registered
                            if (this.authServMode == AuthServiceMode.Default) { //login and redirect to sys config
                                this.authService.login(this.userForm.email, this.userForm.password).subscribe(
                                    () => {
                                        this.router.navigate(["/Sysconfig"]);
                                    }
                                );
                            } else { //EULogin: simply redirect to sys config (registered user is automatically set server side)
                                this.router.navigate(["/Sysconfig"]);
                            }
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