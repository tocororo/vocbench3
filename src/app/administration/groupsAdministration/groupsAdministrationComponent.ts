import { Component } from "@angular/core";
import { UsersGroup } from "../../models/User";
import { UsersGroupsServices } from "../../services/usersGroupsServices";
import { Modal, BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { GroupEditorModalData, GroupEditorModal } from "./groupEditorModal";
import { OverlayConfig } from "ngx-modialog";

@Component({
    selector: "groups-admin-component",
    templateUrl: "./groupsAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class GroupsAdministrationComponent {

    //Group list panel
    private groupList: UsersGroup[];
    private selectedGroup: UsersGroup;

    constructor(private groupsSevice: UsersGroupsServices, private modal: Modal) { }

    ngOnInit() {
        this.initGroups();
    }

    private initGroups(groupToSelect?: UsersGroup) {
        this.groupsSevice.listGroups().subscribe(
            groups => {
                this.groupList = groups;
                this.selectedGroup = null;

                if (groupToSelect != null) {
                    this.groupList.forEach((g: UsersGroup) => {
                        if (g.iri.getURI() == groupToSelect.iri.getURI()) {
                            this.selectGroup(g);
                        }
                    });
                }
            }
        );
    }

    private selectGroup(group: UsersGroup) {
        this.selectedGroup = group;
    }

    private createGroup() {
        this.openGroupEditor("Create group").then(
            data => {
                this.initGroups();
            },
            () => {}
        );
    }

    private deleteGroup() {
        this.groupsSevice.deleteGroup(this.selectedGroup.iri).subscribe(
            stResp => {
                this.initGroups();
            }
        );
    }

    private editGroup() {
        this.openGroupEditor("Edit group " + this.selectedGroup.shortName, this.selectedGroup).then(
            (updatedGroup: UsersGroup) => {
                this.initGroups(updatedGroup);
            },
            () => {}
        );
    }

    private openGroupEditor(title: string, group?: UsersGroup) {
        var modalData = new GroupEditorModalData(title, group);
        const builder = new BSModalContextBuilder<GroupEditorModalData>(
            modalData, undefined, GroupEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(GroupEditorModal, overlayConfig).result;
    }
    

}