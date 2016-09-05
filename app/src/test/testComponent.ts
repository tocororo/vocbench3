import {Component, ViewChild} from "@angular/core";
import {ModalServices, ModalType} from "../widget/modal/modalServices";
import {BrowsingServices} from "../widget/modal/browsingModal/browsingServices";
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
    selector: "test-component",
    templateUrl: "app/src/test/testComponent.html",
    host: { class : "pageComponent" }
})
export class TestComponent {
    
    private typeList = ["info", "error", "warning"];
    
    constructor(public modalService: ModalServices, private browsingService: BrowsingServices, private vbCtx: VocbenchCtx) {}
    
    private confirmResult;
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

    private confirmCheckResult;
    private confirmCheckChecked;
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
    
    private promptResult;
    private promptTitle = "Prompt title";
    private promptLabel = "Field label";
    private promptSanitized = false;
    prompt() {
        this.modalService.prompt(this.promptTitle, this.promptLabel, null, false, this.promptSanitized).then(
            result => {
                this.promptResult = result;
            },
            () => this.promptResult = null
        );
    }
    
    private alertTitle = "Alert title";
    private alertMessage = "Alert message";
    private alertType: ModalType = "info";
    alert() {
        this.modalService.alert(this.alertTitle, this.alertMessage, this.alertType);
    }
    
    private selectionResult;
    private selectionTitle = "Selection title";
    private selectionMessage = "Selection message";
    select() {
        this.modalService.select(this.selectionTitle, this.selectionMessage, ["pippo", "pluto", "paperino"]).then(
            result => {
                this.selectionResult = result;
            },
            () => this.selectionResult = null
        );
    }
    
    private newResourceResult;
    private newResourceTitle = "NewResource title";
    newResource() {
        this.modalService.newResource(this.newResourceTitle, this.vbCtx.getContentLanguage()).then(
            result => {
                this.newResourceResult = result;
            },
            () => this.newResourceResult = null
        );
    }
    
    private newLiteralLangResult;
    private newLiteralLangTitle = "NewLiteralLang title";
    private newLiteralLangValue = "input"
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
    
    private newTypedLiteralResult;
    private newTypedLiteralTitle = "NewTypedLiteral title";
    newTypedLiteral() {
        this.modalService.newTypedLiteral(this.newLiteralLangTitle).then(
            result => {
                this.newTypedLiteralResult = result;
            },
            () => this.newTypedLiteralResult = null
        );
    }
    
    private browseClassTreeResult;
    browseClassTree() {
        this.browsingService.browseClassTree("Select a class").then(
            result => {
                this.browseClassTreeResult = result;
            },
            () => this.browseClassTreeResult = null
        )
    }
    
    private browseInstanceListResult;
    browseInstanceList() {
        this.browsingService.browseInstanceList("Select an instance", this.browseClassTreeResult).then(
            result => {
                this.browseInstanceListResult = result;
            },
            () => this.browseInstanceListResult = null
        )
    }
    
    private browseSchemeListResult;
    browseSchemeList() {
        this.browsingService.browseSchemeList("Select a scheme").then(
            result => {
                this.browseSchemeListResult = result;
            },
            () => this.browseSchemeListResult = null
        )
    }
    
    private browseConceptTreeResult;
    browseConceptTree() {
        this.browsingService.browseConceptTree("Select a concept", this.browseSchemeListResult).then(
            result => {
                this.browseConceptTreeResult = result;
            },
            () => this.browseConceptTreeResult = null
        )
    }
    
    private browsePropertyTreeResult;
    browsePropertyTree() {
        this.browsingService.browsePropertyTree("Select a property").then(
            result => {
                this.browsePropertyTreeResult = result;
            },
            () => this.browsePropertyTreeResult = null
        )
    }
    
}