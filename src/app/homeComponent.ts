import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { ProjectListModal } from './project/projectListModal';
import { VBContext } from "./utils/VBContext";
import { VBPreferences } from "./utils/VBPreferences";
import { UIUtils } from "./utils/UIUtils";
import { User } from "./models/User";
import { Project } from "./models/Project";

@Component({
    selector: "home-component",
    templateUrl: "./homeComponent.html",
    host: { class: "pageComponent" }
})
export class HomeComponent {

    constructor(private router: Router, private modal: Modal) { }

    private isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

    private onLogin() {
        let user: User = VBContext.getLoggedUser();
        if (user.isAdmin()) {
            this.router.navigate(['/Projects']); //redirect to project
        } else {
            const builder = new BSModalContextBuilder<any>();
            let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
            this.modal.open(ProjectListModal, overlayConfig);

        }
    }

}
