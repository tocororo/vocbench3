import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { User } from "./models/User";
import { AdministrationServices } from "./services/administrationServices";
import { VBContext } from "./utils/VBContext";
import { SharedModalServices } from "./widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "home-component",
    templateUrl: "./homeComponent.html",
    host: { class: "pageComponent" }
})
export class HomeComponent {

    safeCustomContentFromPref: SafeHtml;
    safeCustomContentFromFile: SafeHtml;

    privacyStatementAvailable: boolean = false;

    constructor(private router: Router, private sharedModals: SharedModalServices, private administrationService: AdministrationServices, private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.privacyStatementAvailable = VBContext.getSystemSettings().privacyStatementAvailable;

        let homeContent = VBContext.getSystemSettings().homeContent;
        if (homeContent != null) {
            this.safeCustomContentFromPref = this.sanitizer.bypassSecurityTrustHtml(homeContent);
        }

        fetch("assets/ext/home/custom_content.html").then(
            res => res.text()
        ).then(
            htmlContent => {
                this.safeCustomContentFromFile = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
            }
        );
    }

    isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

    onLogin() {
        let user: User = VBContext.getLoggedUser();
        if (user.isAdmin()) {
            this.router.navigate(['/Projects']); //redirect to project
        } else {
            this.sharedModals.changeProject();
        }
    }

    downloadPrivacyStatement() {
        this.administrationService.downloadPrivacyStatement().subscribe();
    }

}
