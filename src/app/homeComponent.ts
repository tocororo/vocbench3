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

    private safeCustomContentFromPref: SafeHtml;
    private safeCustomContentFromFile: SafeHtml;

    private privacyStatementAvailable: boolean = false;

    constructor(private router: Router, private sharedModals: SharedModalServices, private administrationService: AdministrationServices, private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.privacyStatementAvailable = VBContext.getSystemSettings().privacyStatementAvailable;

        let homeContent = VBContext.getSystemSettings().homeContent;
        if (homeContent != null) {
            this.safeCustomContentFromPref = this.sanitizer.bypassSecurityTrustHtml(homeContent);
        }

        /**
         * the following require() are necessary in order to trigger the rule (defined in in webpack.common.js)
         * that matches content in assets/ext/home and to copy each file during the creation of the distribution
         */
        require('file-loader?name=[name].[ext]!../assets/ext/home/example.png');
        require('file-loader?name=[name].[ext]!../assets/ext/home/custom_content.html');
        fetch("assets/ext/home/custom_content.html").then(
            res => res.text()
        ).then(
            htmlContent => {
                this.safeCustomContentFromFile = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
            }
        );
    }

    private isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

    private onLogin() {
        let user: User = VBContext.getLoggedUser();
        if (user.isAdmin()) {
            this.router.navigate(['/Projects']); //redirect to project
        } else {
            this.sharedModals.changeProject();
        }
    }

    private downloadPrivacyStatement() {
        this.administrationService.downloadPrivacyStatement().subscribe();
    }

}
