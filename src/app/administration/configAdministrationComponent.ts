import { Component } from "@angular/core";

import { AdministrationServices } from "../services/administrationServices";

@Component({
    selector: "config-admin-component",
    templateUrl: "./configAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class ConfigAdministrationComponent {

    private pristineConfig: any = {};
    private config: any = {};

    constructor(private adminService: AdministrationServices) {}

    ngOnInit() {
        this.adminService.getAdministrationConfig().subscribe(
            conf => {
                this.config = conf;
                this.pristineConfig = Object.assign({}, this.config); //clone 
            }
        )
    }

    private submitChange() {
        console.log("submitting config with values:\n"
        +  "emailAdminAddress: " + this.config.emailAdminAddress + "\n"
        +  "emailFromAddress: " + this.config.emailFromAddress + "\n"
        +  "emailFromPassword: " + this.config.emailFromPassword + "\n"
        +  "emailFromAlias: " + this.config.emailFromAlias + "\n"
        +  "emailFromHost: " + this.config.emailFromHost + "\n"
        +  "emailFromPort: " + this.config.emailFromPort + "\n"
        )
        this.adminService.updateAdministrationConfig(this.config.emailAdminAddress, this.config.emailFromAddress,
            this.config.emailFromPassword, this.config.emailFromAlias, this.config.emailFromHost, this.config.emailFromPort).subscribe(
                stResp => {
                    this.pristineConfig = Object.assign({}, this.config); //changes done => update the pristine config
                }
            );
    }

    private isConfigChanged(): boolean {
        for (var key in this.pristineConfig) {
            if (this.pristineConfig[key] != this.config[key]) {
                return true;
            }
        }
        return false;
    }

}