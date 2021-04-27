import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project } from "src/app/models/Project";
import { Role } from "src/app/models/User";
import { AdministrationServices } from "src/app/services/administrationServices";

@Component({
    selector: "role-description-modal",
    templateUrl: "./roleDescriptionModal.html",
})
export class RoleDescriptionModal {
    
    @Input() role: Role;
    @Input() project: Project;

    capabilityList: string[];

    constructor(public activeModal: NgbActiveModal, private adminService: AdministrationServices) {}

    ngOnInit() {
        this.adminService.listCapabilities(this.role, this.project).subscribe(
            capabilities => {
                this.capabilityList = capabilities;
            }
        );
    }

    ok() {
        this.activeModal.close();
    }

}