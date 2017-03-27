import { Component, ViewChild } from "@angular/core";
import { ModalServices, ModalType } from "../widget/modal/modalServices";
import { BrowsingServices } from "../widget/modal/browsingModal/browsingServices";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "test-component",
    templateUrl: "./testComponent.html",
    host: { class: "pageComponent" }
})
export class TestComponent {

    private typeList = ["info", "error", "warning"];

    constructor(public modalService: ModalServices, private browsingService: BrowsingServices) { }

    private confirmResult: string;
    private confirmTitle = "Confirm title";
    private confirmMessage = "Confirm message";
    private confirmType: ModalType = "info";
    confirm() {
        this.modalService.confirm(this.confirmTitle, this.confirmMessage, this.confirmType).then(
            result => {
                this.confirmResult = "Yes"
            },
            () => this.confirmResult = "No"
        );
    }

    private confirmCheckResult: string;
    private confirmCheckChecked: any;
    private confirmCheckTitle = "Confirm with Check title";
    private confirmCheckMessage = "Confirm with check message";
    private confirmCheckLabel = "Confirm with check label";
    private confirmCheckType: ModalType = "info";
    confirmCheck() {
        this.modalService.confirmCheck(this.confirmCheckTitle, this.confirmCheckMessage, this.confirmCheckLabel, this.confirmType).then(
            result => {
                this.confirmCheckResult = "Yes";
                this.confirmCheckChecked = result;
            },
            () => this.confirmCheckResult = "No"
        );
    }

    private promptResult: any;
    private promptTitle: string = "Prompt title";
    private promptLabel: string = "Field label";
    private promptSanitized = false;
    prompt() {
        this.modalService.prompt(this.promptTitle, this.promptLabel, null, null, false, this.promptSanitized).then(
            result => {
                this.promptResult = result;
            },
            () => this.promptResult = null
        );
    }

    private alertTitle: string = "Alert title";
    private alertMessage: string = "Alert message";
    private alertType: ModalType = "info";
    alert() {
        this.modalService.alert(this.alertTitle, this.alertMessage, this.alertType);
    }

    private selectionResult: any;
    private selectionTitle: string = "Selection title";
    private selectionMessage: string = "Selection message";
    select() {
        this.modalService.select(this.selectionTitle, this.selectionMessage, ["pippo", "pluto", "paperino"]).then(
            result => {
                this.selectionResult = result;
            },
            () => this.selectionResult = null
        );
    }

    private newResourceResult: any;
    private newResourceTitle = "NewResource title";
    newResource() {
        this.modalService.newResource(this.newResourceTitle).then(
            result => {
                this.newResourceResult = result;
            },
            () => this.newResourceResult = null
        );
    }

    private newLiteralLangResult: any;
    private newLiteralLangTitle: string = "NewLiteralLang title";
    private newLiteralLangValue: string = "input"
    private valueReadonly = false;
    private lang = "en";
    private langReadonly = false;
    newLiteralLang() {
        this.modalService.newPlainLiteral(this.newLiteralLangTitle, this.newLiteralLangValue, this.valueReadonly, this.lang, this.langReadonly).then(
            result => {
                this.newLiteralLangResult = result;
            },
            () => this.newLiteralLangResult = null
        );
    }

    private newTypedLiteralResult: any;
    private newTypedLiteralTitle: string = "NewTypedLiteral title";
    newTypedLiteral() {
        this.modalService.newTypedLiteral(this.newLiteralLangTitle).then(
            result => {
                this.newTypedLiteralResult = result;
            },
            () => this.newTypedLiteralResult = null
        );
    }

    private filePickerResult: File;
    private filePickerTitle: string = "Select a file";
    private filePickerAccept: string = "application/rdf+xml";
    private filePickerMessage: string = "Select a file from your filesystem";
    private filePickerLabel: string = "File";
    private filePickerPlaceholder: string = "select a file";
    selectFile() {
        this.modalService.selectFile(this.filePickerTitle, this.filePickerMessage, this.filePickerLabel,
            this.filePickerPlaceholder, this.filePickerAccept).then(
            (result: any) => {
                this.filePickerResult = result;
            },
            () => this.filePickerResult = null
            );
    }

    private browseClassTreeResult: any;
    browseClassTree() {
        this.browsingService.browseClassTree("Select a class").then(
            result => {
                this.browseClassTreeResult = result;
            },
            () => this.browseClassTreeResult = null
        )
    }

    private browseInstanceListResult: any;
    browseInstanceList() {
        this.browsingService.browseInstanceList("Select an instance", this.browseClassTreeResult).then(
            result => {
                this.browseInstanceListResult = result;
            },
            () => this.browseInstanceListResult = null
        )
    }

    private browseSchemeListResult: any;
    browseSchemeList() {
        this.browsingService.browseSchemeList("Select a scheme").then(
            result => {
                this.browseSchemeListResult = result;
            },
            () => this.browseSchemeListResult = null
        )
    }

    private browseConceptTreeResult: any;
    browseConceptTree() {
        this.browsingService.browseConceptTree("Select a concept", this.browseSchemeListResult).then(
            result => {
                this.browseConceptTreeResult = result;
            },
            () => this.browseConceptTreeResult = null
        )
    }

    private browsePropertyTreeResult: any;
    browsePropertyTree() {
        this.browsingService.browsePropertyTree("Select a property").then(
            result => {
                this.browsePropertyTreeResult = result;
            },
            () => this.browsePropertyTreeResult = null
        )
    }

}