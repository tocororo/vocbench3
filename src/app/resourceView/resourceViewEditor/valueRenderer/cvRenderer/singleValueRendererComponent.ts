import { Component, Input } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { AbstractSingleValueView } from "src/app/models/CustomViews";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { AbstractViewRendererComponent } from "./abstractViewRenderer";

@Component({
    selector: "single-value-renderer",
    templateUrl: "./singleValueRendererComponent.html",
    // host: { class: "hbox" },
})
export class SingleValueRendererComponent extends AbstractViewRendererComponent {

    @Input() view: AbstractSingleValueView;

    constructor(private cvService: CustomViewsServices, private modalService: NgbModal, private translateService: TranslateService) {
        super()
    }

    protected processInput(): void {
    }
    
    onUpdate() {
        this.update.emit();
    }


}