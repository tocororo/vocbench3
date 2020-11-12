import { Component } from "@angular/core";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../utils/VBActions";

@Component({
    selector: "custom-services-router",
    templateUrl: "./customServiceRouterComponent.html",
    host: { class: "pageComponent" }
})
export class CustomServiceRouterComponent {

    currentRoute: "customService" | "reporter";

    csAuthorized: boolean;
    reporterAuthorized: boolean;

    constructor() { }

    ngOnInit() {
        this.csAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.customServiceRead);
        this.reporterAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterRead);
        //according the authorization initialize the proper tab
        if (this.csAuthorized) {
            this.currentRoute = "customService";
        } else {
            //no need to check the auth for reporter since this page is accessible only if at least one of the two sub-route is authorized
            this.currentRoute = "reporter";
        }
    }

}