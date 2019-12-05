import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { User } from "./models/User";
import { ProjectListModal } from './project/projectListModal';
import { AdministrationServices } from "./services/administrationServices";
import { VBContext } from "./utils/VBContext";

@Component({
    selector: "home-component",
    templateUrl: "./homeComponent.html",
    host: { class: "pageComponent" }
})
export class HomeComponent {

    private safeCustomContentFromPref: SafeHtml;
    private safeCustomContentFromFile: SafeHtml;

    private privacyStatementAvailable: boolean = false;

    constructor(private router: Router, private modal: Modal, private administrationService: AdministrationServices, private sanitizer: DomSanitizer) { }

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
            const builder = new BSModalContextBuilder<any>();
            let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
            this.modal.open(ProjectListModal, overlayConfig);
        }
    }

    private downloadPrivacyStatement() {
        this.administrationService.downloadPrivacyStatement().subscribe();
    }

}
