import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { VBContext } from "../../../../utils/VBContext"

export class NewResourceModalData extends BSModalContext {
    constructor(
        public title: string = "Modal title",
        public lang: string
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

    @ViewChild("toFocus") inputToFocus: ElementRef;

    private submitted: boolean = false;

    private label: string;
    private lang: string;
    private uri: string;

    constructor(public dialog: DialogRef<NewResourceModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
    }

    ngAfterViewInit() {
        this.inputToFocus.nativeElement.focus();
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
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

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        var returnedData: { uri: string, label: string, lang: string } = {
            uri: null, label: this.label, lang: this.lang
        }
        if (this.uri != null && this.uri.trim() == "") {
            returnedData.uri = this.uri;
        }
        this.dialog.close(returnedData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}