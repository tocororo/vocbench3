import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { ProjectListModal } from './project/projectListModal';
import { VBContext } from "./utils/VBContext";
import { VBProperties } from "./utils/VBProperties";
import { User } from "./models/User";
import { Languages, Language } from "./models/LanguagesCountries";
import { BasicModalServices } from "./widget/modal/basicModal/basicModalServices";
import { PreferencesSettingsServices } from "./services/preferencesSettingsServices";

@Component({
    selector: "home-component",
    templateUrl: "./homeComponent.html",
    host: { class: "pageComponent" }
})
export class HomeComponent {

    constructor(private prefSettingService: PreferencesSettingsServices, private basicModals: BasicModalServices, 
        private router: Router, private modal: Modal) { }

    ngOnInit() {
        if (Languages.getSystemLanguages() == null) {
            Languages.initSystemLanguage(this.prefSettingService, this.basicModals);
        }
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
            let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
            this.modal.open(ProjectListModal, overlayConfig);
        }
    }

}
