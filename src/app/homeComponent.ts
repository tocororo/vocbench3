import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { User } from "./models/User";
import { AdministrationServices } from "./services/administrationServices";
import { VBContext } from "./utils/VBContext";
import { SharedModalServices } from "./widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "home-component",
    templateUrl: "./homeComponent.html",
    styles: [`
        .organizzationName { color: #002244; font-weight:bold; } 
        .organizzationSubtitle { color: #aa4400; font-size: 10px; font-weight: bold; font-style: italic; }
    `],
    host: { class: "pageComponent" }
})
export class HomeComponent {

    safeCustomContentFromPref: SafeHtml;
    safeCustomContentFromFile: SafeHtml;

    privacyStatementAvailable: boolean = false;

    constructor(private router: Router, private sharedModals: SharedModalServices, private administrationService: AdministrationServices, 
        private sanitizer: DomSanitizer) {
    }

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
