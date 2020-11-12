import { Component } from "@angular/core";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../utils/VBActions";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "admin-component",
    templateUrl: "./administrationComponent.html",
    host: { class: "pageComponent" }
})
export class AdministrationComponent {

    constructor() { }

    isAdmin(): boolean {
        var user = VBContext.getLoggedUser();
        if (user != null) {
            return user.isAdmin();
        }
        return false;
    }

    isRoleManagementAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationRoleManagement);
    }

    isProjManagementAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationProjectManagement) ||
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserRoleManagement) ||
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserGroupManagement)
        );
    }

}