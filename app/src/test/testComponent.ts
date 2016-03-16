import {Component, ViewChild} from "angular2/core";
import {ModalServices} from "../widget/modal/modalServices";
import {SanitizerDirective} from "../utils/directives/sanitizerDirective";

@Component({
    selector: "test-component",
    templateUrl: "app/src/test/testComponent.html",
    directives: [SanitizerDirective],
    host: { class : "pageComponent" }
})
export class TestComponent {
    
    private typeList = ["info", "error", "warning"];
    
    constructor(public modalService: ModalServices) {}
    
    private confirmResult;
    private confirmTitle = "Confirm title";
    private confirmMessage = "Confirm message";
    private confirmType = "info";
    
    confirm() {
        this.modalService.confirm(this.confirmTitle, this.confirmMessage, this.confirmType).then(
            result => {
                this.confirmResult = "Yes"
            },
            () => this.confirmResult = "No"
        );
    }

    
    private promptResult;
    private promptTitle = "Prompt title";
    private promptLabel = "Field label";
    private promptSanitized = false;

    prompt() {
        this.modalService.prompt(this.promptTitle, this.promptLabel, this.promptSanitized).then(
            result => {
                this.promptResult = result;
            },
            () => this.promptResult = null
        );
    }
    
    private alertTitle = "Alert title";
    private alertMessage = "Alert message";
    private alertType = "info";
    
    alert() {
        this.modalService.alert(this.alertTitle, this.alertMessage, this.alertType);
    }
    
    
    private newResourceResult;
    private newResourceTitle = "NewResource title";
    
    newResource() {
        this.modalService.newResource(this.newResourceTitle).then(
            result => {
                this.newResourceResult = result;
            },
            () => this.newResourceResult = null
        );
    }
    
    private newLiteralLangResult;
    private newLiteralLangTitle = "NewLiteralLang title";
    
    newLiteralLang() {
        this.modalService.newLiteralLang(this.newLiteralLangTitle).then(
            result => {
                this.newLiteralLangResult = result;
            },
            () => this.newLiteralLangResult = null
        );
    }
    
    private sanitizable = false;
    
}