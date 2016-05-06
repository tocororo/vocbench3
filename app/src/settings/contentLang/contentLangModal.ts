import {Component} from "@angular/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {Languages} from "../../utils/LanguagesCountries";

@Component({
    selector: "content-lang-modal",
    templateUrl: "app/src/settings/contentLang/contentLangModal.html",
})
export class ContentLangModal implements ICustomModalComponent {
    
    private languages = Languages.languageList;
    
    private contentLang: string;
    
    constructor(public dialog: ModalDialogInstance, public vbCtx: VocbenchCtx, public evtHandler: VBEventHandler) {}
    
    private getFlagImgSrc() {
        return ResourceUtils.getFlagImgSrc(this.contentLang);
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
        this.contentLang = this.vbCtx.getContentLanguage();
    }

    ok(event) {
        var oldLang = this.vbCtx.getContentLanguage();
        //update content language only if changed and emit event
        if (oldLang != this.contentLang) {
            this.vbCtx.setContentLanguage(this.contentLang);
            this.evtHandler.contentLangChangedEvent.emit(this.contentLang);
        }
        event.stopPropagation();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
}