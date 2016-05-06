import {Component} from "@angular/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {ResourceUtils} from "../../utils/ResourceUtils";

@Component({
    selector: "content-lang-modal",
    templateUrl: "app/src/settings/contentLang/contentLangModal.html",
})
export class ContentLangModal implements ICustomModalComponent {
    
    private languages = [
        { name: "Arabic", tag: "ar" },
        { name: "Czech", tag: "cs" },
        { name: "German", tag: "de" },
        { name: "Greek", tag: "el" },
        { name: "English", tag: "en" },
        { name: "Spanish", tag: "es" },
        { name: "French", tag: "fr" },
        { name: "Hindi", tag: "hi" },
        { name: "Italian", tag: "it" },
        { name: "Japanese", tag: "ja" },
        { name: "Korean", tag: "ko" },
        { name: "Dutch", tag: "nl" },
        { name: "Portuguese", tag: "pt" },
        { name: "Russian", tag: "ru" },
        { name: "Thai", tag: "th" },
        { name: "Turkish", tag: "tr" },
        { name: "Ukrainian", tag: "uk" },
        { name: "Chinese", tag: "zh" }
    ];
    
    private contentLang: string;
    
    constructor(public dialog: ModalDialogInstance, public vbCtx: VocbenchCtx) {}
    
    private getFlagImgSrc() {
        return ResourceUtils.getFlagImgSrc(this.contentLang);
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
        this.contentLang = this.vbCtx.getContentLanguage();
    }

    ok(event) {
        this.vbCtx.setContentLanguage(this.contentLang);
        event.stopPropagation();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
}