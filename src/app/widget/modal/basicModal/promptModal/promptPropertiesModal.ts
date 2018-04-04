import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";

export class PromptPropertiesModalData extends BSModalContext {
    
    constructor(
        public title: string,
        public properties: { [key: string]: string },
        public allowEmpty: boolean
    ) {
        super();
    }
}

@Component({
    selector: "prompt-prop-modal",
    templateUrl: "./promptPropertiesModal.html",
})
export class PromptPropertiesModal implements ModalComponent<PromptPropertiesModalData> {
    context: PromptPropertiesModalData;

    private properties: { [key: string]: string };
    private mapKeys: string[] = [];

    constructor(public dialog: DialogRef<PromptPropertiesModalData>) {
        this.context = dialog.context;
        this.properties = JSON.parse(JSON.stringify(this.context.properties));
    }

    ngOnInit() {
        for (let key in this.properties) {
            this.mapKeys.push(key);
        }
    }

    private isOkClickable(): boolean {
        if (this.context.allowEmpty) {
            return true;
        } else {
            let empty: boolean = false;
            this.mapKeys.forEach((key: string) => {
                if (this.properties[key] == null || this.properties[key].trim() == "") {
                    empty = true;
                }
            });
            return !empty;
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.properties);
    }

    cancel() {
        this.dialog.dismiss();
    }

}