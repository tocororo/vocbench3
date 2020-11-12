import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from 'rxjs';
import { UsersGroup } from "../../models/User";
import { UsersGroupsServices } from "../../services/usersGroupsServices";

@Component({
    selector: "group-editor-modal",
    templateUrl: "./groupEditorModal.html",
})
export class GroupEditorModal {
    @Input() title: string;
    @Input() group: UsersGroup;


    private groupPristine: UsersGroup;

    shortName: string;
    fullName: string;
    description: string;
    webPage: string;
    private logoUrl: string;

    constructor(public activeModal: NgbActiveModal, private groupsService: UsersGroupsServices) { }

    ngOnInit() {
        if (this.group != null) { // edit mode
            let group: UsersGroup = this.group;
            this.shortName = group.shortName;
            this.fullName = group.fullName;
            this.description = group.description;
            this.webPage = group.webPage;
            this.logoUrl = group.logoUrl;

            this.groupPristine = new UsersGroup(group.iri, group.shortName, group.fullName, group.description, group.webPage, group.logoUrl);
        }
    }

    isDataValid(): boolean {
        return this.shortName && this.shortName.trim() != "";
    }

    ok() {
        if (!this.isDataValid()) {
            return;
        }

        if (this.group) { //edit
            let updateFnArray: any[] = [];
            if (this.shortName != this.groupPristine.shortName) {
                updateFnArray.push(this.groupsService.updateGroupShortName(this.groupPristine.iri, this.shortName));
            }
            if (this.fullName != this.groupPristine.fullName) {
                updateFnArray.push(this.groupsService.updateGroupFullName(this.groupPristine.iri, this.fullName));
            }
            if (this.description != this.groupPristine.description) {
                updateFnArray.push(this.groupsService.updateGroupDescription(this.groupPristine.iri, this.description));
            }
            if (this.webPage != this.groupPristine.webPage) {
                updateFnArray.push(this.groupsService.updateGroupWebPage(this.groupPristine.iri, this.webPage));
            }
            if (this.logoUrl != this.groupPristine.logoUrl) {
                updateFnArray.push(this.groupsService.updateGroupLogoUrl(this.groupPristine.iri, this.logoUrl));
            }
            forkJoin(updateFnArray).subscribe(
                () => {
                    let updatedGroup: UsersGroup = new UsersGroup(this.groupPristine.iri, this.shortName, this.fullName, 
                        this.description, this.webPage, this.logoUrl);
                    this.activeModal.close(updatedGroup);
                }
            );
        } else { //create
            this.groupsService.createGroup(this.shortName, this.fullName, this.description, this.webPage, this.logoUrl).subscribe(
                stResp => {
                    this.activeModal.close();
                }
            );
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}