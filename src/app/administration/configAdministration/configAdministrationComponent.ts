import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AdministrationServices } from "../../services/administrationServices";
import { AuthServices } from "../../services/authServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "config-admin-component",
    templateUrl: "./configAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class ConfigAdministrationComponent {

    private pristineConfig: any = {};
    private pristineAdminMail: string;
    private config: any = {};

    constructor(private adminService: AdministrationServices, private authService: AuthServices, 
        private basicModals: BasicModalServices, private router: Router) {}

    ngOnInit() {
        this.adminService.getAdministrationConfig().subscribe(
            conf => {
                this.config = conf;
                this.pristineConfig = Object.assign({}, this.config); //clone 
            }
        )
    }

    private submitChange() {
        if (this.pristineConfig.emailAdminAddress != this.config.emailAdminAddress) {
            this.basicModals.confirm("Update configuration", "The administrator email address has changed. " + 
                "If you confirm you'll be logged out. Are you sure to continue?", "warning").then(
                result => {
                    this.updateAdminConfig().subscribe(
                        stResp => {
                            this.authService.logout().subscribe(
                                stResp => {
                                    this.router.navigate(["/Home"]);
                                }
                            );
                        }
                    );
                },
                () => {}
            );
        } else {
            this.updateAdminConfig().subscribe(
                stResp => {
                    this.pristineConfig = Object.assign({}, this.config); //changes done => update the pristine config
                }
            );
        }
    }

    private updateAdminConfig() {
        return this.adminService.updateAdministrationConfig(this.config.emailAdminAddress, this.config.emailFromAddress,
            this.config.emailFromPassword, this.config.emailFromAlias, this.config.emailFromHost, this.config.emailFromPort);
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