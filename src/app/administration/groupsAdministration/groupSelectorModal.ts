import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsersGroup } from "src/app/models/User";
import { UsersGroupsServices } from 'src/app/services/usersGroupsServices';

@Component({
    selector: "group-selector-modal",
    templateUrl: "./groupSelectorModal.html",
})
export class GroupSelectorModal {
    @Input() title: string;
    @Input() groups: UsersGroup[]; //selected roles at init
    @Input() multiselection: boolean = false;
    @Input() requireSelection: boolean = false;

    groupItems: GroupItem[] = [];

    constructor(public activeModal: NgbActiveModal, private usersGroupService: UsersGroupsServices) {}

    ngOnInit() {
        this.usersGroupService.listGroups().subscribe(
            groups => {
                groups.forEach(g => {
                    let selected: boolean = false;
                    if (this.multiselection && this.groups && this.groups.length > 0) {
                        selected = this.groups.some(gInput => gInput.shortName == g.shortName);
                    } else if (!this.multiselection && this.groups && this.groups.length == 1) {
                        selected = this.groups[0].shortName == g.shortName;
                    }
                    this.groupItems.push({
                        group: g,
                        selected: selected
                    });
                });
            }
        );
    }

    selectRole(group: GroupItem) {
        if (this.multiselection) {
            group.selected = !group.selected;
        } else {
            this.groupItems.forEach(g => {
                if (g == group) {
                    g.selected = true;
                } else {
                    g.selected = false;
                }
            });
        }
    }

    isDataValid(): boolean {
        return !this.requireSelection || this.groupItems.some(l => l.selected);
    }

    ok() {
        this.activeModal.close(this.groupItems.filter(g => g.selected).map(g => g.group));
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

interface GroupItem {
    group: UsersGroup;
    selected: boolean;
}