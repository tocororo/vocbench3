import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource, ResAttribute } from '../../../models/ARTResources';
import { UIUtils } from "../../../utils/UIUtils";

@Component({
    selector: "constituent-list-creator-modal",
    templateUrl: "./constituentListCreatorModal.html",
})
export class ConstituentListCreatorModal {
    @Input() title: string;

    // private constituentCls: ARTURIResource = Decomp.component;

    selectedConstituentSource: ARTURIResource;
    selectedConstituentTarget: ARTURIResource;

    list: ARTURIResource[] = [];

    ordered: boolean = true;

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    addConstituentToList() {
        let constituent: ARTURIResource = this.selectedConstituentSource.clone();
        constituent.deleteAdditionalProperty(ResAttribute.SELECTED);
        this.list.push(constituent);
    }

    removeConstituentFromList() {
        this.list.splice(this.list.indexOf(this.selectedConstituentTarget), 1);
        this.selectedConstituentTarget = null;
    }

    moveUp() {
        var idx = this.list.indexOf(this.selectedConstituentTarget);
        this.list.splice(idx-1, 0, this.list.splice(idx, 1)[0]);
    }
    moveDown() {
        var idx = this.list.indexOf(this.selectedConstituentTarget);
        this.list.splice(idx+1, 0, this.list.splice(idx, 1)[0]);
    }

    isFirstInList(): boolean {
        return this.list[0] == this.selectedConstituentTarget;
    }
    isLastInList(): boolean {
        return this.list[this.list.length-1] == this.selectedConstituentTarget;   
    }

    ok() {
        this.activeModal.close({list: this.list, ordered: this.ordered});
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export class ConstituentListCreatorModalReturnData {
    list: ARTURIResource[];
    ordered: boolean;
}