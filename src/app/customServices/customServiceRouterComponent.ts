import { Component } from "@angular/core";

@Component({
    selector: "custom-services-router",
    templateUrl: "./customServiceRouterComponent.html",
    host: { class: "pageComponent" }
})
export class CustomServiceRouterComponent {

    private currentRoute: "editor" | "reporter" = "editor";

    constructor() { }

    private showEditor(): boolean {
        return this.currentRoute == "editor";
    }

}