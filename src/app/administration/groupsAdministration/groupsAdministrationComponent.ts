import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { ModalOptions, Translation } from 'src/app/widget/modal/Modals';
import { UsersGroup } from "../../models/User";
import { UsersGroupsServices } from "../../services/usersGroupsServices";
import { GroupEditorModal } from "./groupEditorModal";

@Component({
    selector: "groups-admin-component",
    templateUrl: "./groupsAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class GroupsAdministrationComponent {

    //Group list panel
    groupList: UsersGroup[];
    selectedGroup: UsersGroup;

    constructor(private groupsSevice: UsersGroupsServices, private modalService: NgbModal, private translateService: TranslateService) { }

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

    createGroup() {
        this.openGroupEditor({key:"ACTIONS.CREATE_GROUP"}).then(
            data => {
                this.initGroups();
            },
            () => {}
        );
    }

    deleteGroup() {
        this.groupsSevice.deleteGroup(this.selectedGroup.iri).subscribe(
            stResp => {
                this.initGroups();
            }
        );
    }

    editGroup() {
        this.openGroupEditor({key:"ACTIONS.EDIT_GROUP"}, this.selectedGroup).then(
            (updatedGroup: UsersGroup) => {
                this.initGroups(updatedGroup);
            },
            () => {}
        );
    }

    private openGroupEditor(title: Translation, group?: UsersGroup) {
        const modalRef: NgbModalRef = this.modalService.open(GroupEditorModal, new ModalOptions());
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
		modalRef.componentInstance.group = group;
        return modalRef.result;
    }
    

}