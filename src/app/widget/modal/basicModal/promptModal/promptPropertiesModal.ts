import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "prompt-prop-modal",
    templateUrl: "./promptPropertiesModal.html",
})
export class PromptPropertiesModal {
    @Input() title: string;
    @Input() properties: { [key: string]: string };
    @Input() allowEmpty: boolean;

    private props: { [key: string]: string };
    mapKeys: string[] = [];

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.props = JSON.parse(JSON.stringify(this.properties));
        for (let key in this.props) {
            this.mapKeys.push(key);
        }
    }

    isOkClickable(): boolean {
        if (this.allowEmpty) {
            return true;
        } else {
            let empty: boolean = false;
            this.mapKeys.forEach((key: string) => {
                if (this.props[key] == null || this.props[key].trim() == "") {
                    empty = true;
                }
            });
            return !empty;
        }
    }

    ok() {
        this.activeModal.close(this.props);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}