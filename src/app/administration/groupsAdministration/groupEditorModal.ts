import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { UsersGroup } from "../../models/User";
import { UsersGroupsServices } from "../../services/usersGroupsServices";

export class GroupEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public group?: UsersGroup) {
        super();
    }
}

@Component({
    selector: "group-editor-modal",
    templateUrl: "./groupEditorModal.html",
})
export class GroupEditorModal implements ModalComponent<GroupEditorModalData> {
    context: GroupEditorModalData;

    private groupPristine: UsersGroup;

    private shortName: string;
    private fullName: string;
    private description: string;
    private webPage: string;
    private logoUrl: string;

    constructor(public dialog: DialogRef<GroupEditorModalData>, private groupsService: UsersGroupsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.group != null) { // edit mode
            let group: UsersGroup = this.context.group;
            this.shortName = group.shortName;
            this.fullName = group.fullName;
            this.description = group.description;
            this.webPage = group.webPage;
            this.logoUrl = group.logoUrl;

            this.groupPristine = new UsersGroup(group.iri, group.shortName, group.fullName, group.description, group.webPage, group.logoUrl);
        }
    }

    private isDataValid(): boolean {
        return this.shortName && this.shortName.trim() != "";
    }

    ok(event: Event) {
        if (!this.isDataValid()) {
            return;
        }

        if (this.context.group) { //edit
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
            Observable.forkJoin(updateFnArray).subscribe(
                stResp => {
                    let updatedGroup: UsersGroup = new UsersGroup(this.groupPristine.iri, this.shortName, this.fullName, 
                        this.description, this.webPage, this.logoUrl);
                    event.stopPropagation();
                    event.preventDefault();
                    this.dialog.close(updatedGroup);
                }
            );
        } else { //create
            this.groupsService.createGroup(this.shortName, this.fullName, this.description, this.webPage, this.logoUrl).subscribe(
                stResp => {
                    event.stopPropagation();
                    event.preventDefault();
                    this.dialog.close();
                }
            );
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}