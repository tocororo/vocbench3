import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, ResAttribute } from '../../models/ARTResources';
import { Decomp } from "../../models/Vocabulary";
import { OntoLexLemonServices } from "../../services/ontoLexLemonServices";

export class ConstituentListCreatorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "constituent-list-creator-modal",
    templateUrl: "./constituentListCreatorModal.html",
})
export class ConstituentListCreatorModal implements ModalComponent<ConstituentListCreatorModalData> {
    context: ConstituentListCreatorModalData;

    // private constituentCls: ARTURIResource = Decomp.component;

    private selectedConstituentSource: ARTURIResource;
    private selectedConstituentTarget: ARTURIResource;

    private list: ARTURIResource[] = [];

    private ordered: boolean = true;

    constructor(public dialog: DialogRef<ConstituentListCreatorModalData>, private ontolexService: OntoLexLemonServices) {
        this.context = dialog.context;
    }

    private addConstituentToList() {
        let constituent: ARTURIResource = this.selectedConstituentSource.clone();
        constituent.deleteAdditionalProperty(ResAttribute.SELECTED);
        this.list.push(constituent);
    }

    private removeConstituentFromList() {
        this.list.splice(this.list.indexOf(this.selectedConstituentTarget), 1);
        this.selectedConstituentTarget = null;
    }

    private moveUp() {
        var idx = this.list.indexOf(this.selectedConstituentTarget);
        this.list.splice(idx-1, 0, this.list.splice(idx, 1)[0]);
    }
    private moveDown() {
        var idx = this.list.indexOf(this.selectedConstituentTarget);
        this.list.splice(idx+1, 0, this.list.splice(idx, 1)[0]);
    }

    private isFirstInList(): boolean {
        return this.list[0] == this.selectedConstituentTarget;
    }
    private isLastInList(): boolean {
        return this.list[this.list.length-1] == this.selectedConstituentTarget;   
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close({list: this.list, ordered: this.ordered});
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class ConstituentListCreatorModalReturnData {
    list: ARTURIResource[];
    ordered: boolean;
}