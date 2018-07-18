import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { ProjectListModal } from './project/projectListModal';
import { VBContext } from "./utils/VBContext";
import { User } from "./models/User";
import { Languages, Language } from "./models/LanguagesCountries";

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
            let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
            this.modal.open(ProjectListModal, overlayConfig);
        }
    }

}
