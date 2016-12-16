import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {VBEventHandler} from "../../../utils/VBEventHandler";

@Component({
    selector: "content-lang-modal",
    templateUrl: "./contentLangModal.html",
})
export class ContentLangModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;
    
    private contentLang: string;
    
    constructor(public dialog: DialogRef<BSModalContext>, public vbCtx: VocbenchCtx, public evtHandler: VBEventHandler) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.contentLang = this.vbCtx.getContentLanguage();
    }
    
    private onLangChange(newLang: string) {
        this.contentLang = newLang;
    }

    ok(event: Event) {
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