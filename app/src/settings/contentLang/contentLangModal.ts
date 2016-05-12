import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {Languages} from "../../utils/LanguagesCountries";

/**
 * Useless class with empty data
 * (I need this cause currently I don't know how to create a Custom Modal without context data)
 */
export class ContentLangModalData extends BSModalContext {
    constructor() {
        super();
    }
}

@Component({
    selector: "content-lang-modal",
    templateUrl: "app/src/settings/contentLang/contentLangModal.html",
})
export class ContentLangModal implements ModalComponent<ContentLangModalData> {
    context: ContentLangModalData;
    
    private languages = Languages.languageList;
    
    private contentLang: string;
    
    constructor(public dialog: DialogRef<ContentLangModalData>, public vbCtx: VocbenchCtx, public evtHandler: VBEventHandler) {
        this.context = dialog.context;
    }
    
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