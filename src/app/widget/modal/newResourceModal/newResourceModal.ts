import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {VocbenchCtx} from "../../../utils/VocbenchCtx"

export class NewResourceModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public lang: string = "en"
    ) {
        super();
    }
}

@Component({
    selector: "new-resource-modal",
    templateUrl: "./newResourceModal.html",
})
export class NewResourceModal implements ModalComponent<NewResourceModalData> {
    context: NewResourceModalData;
    
    private submitted: boolean = false;
    
    private label: string;
    private lang: string;
    private namespace: string = "";
    private localName: string;

    constructor(public dialog: DialogRef<NewResourceModalData>, private vbCtx: VocbenchCtx) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.lang = this.context.lang;
        document.getElementById("toFocus").focus();

        this.namespace = this.vbCtx.getDefaultNamespace();
    }
    
    private onKeydown(event) {
        if (event.which == "13") {
            this.submitted = true;
            if (this.isInputValid()) {
                this.ok(event);
            }
        }
    }
    
    private onLangChange(newLang: string) {
        this.lang = newLang;
    }
    
    private isInputValid(): boolean {
        return (this.label != undefined && this.label.trim() != "");
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.localName && this.localName.trim() == "") {//if localName has no content return null localName
            this.dialog.close({name: null, label: this.label, lang: this.lang});    
        } else {
            this.dialog.close({name: this.localName, label: this.label, lang: this.lang});
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}