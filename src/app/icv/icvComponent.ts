import { Component } from "@angular/core";

@Component({
    selector: "icv-component",
    template: `
        <div class="vbox">
            <router-outlet></router-outlet>
        </div>
    `,
    host: { class: "pageComponent" }
})
export class IcvComponent {}




