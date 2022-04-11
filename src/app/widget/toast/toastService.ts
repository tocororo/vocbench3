import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TextOrTranslation, TranslationUtils } from "../modal/Modals";
import { Toast, ToastOpt } from "./Toasts";

@Injectable()
export class ToastService {

    constructor(private translateService: TranslateService) {}
    
    toasts: Toast[] = [];

    show(title: TextOrTranslation, message: TextOrTranslation, options?: ToastOpt) {
        let t = TranslationUtils.getTranslatedText(title, this.translateService);
        let msg = TranslationUtils.getTranslatedText(message, this.translateService);
        let opt: ToastOpt = new ToastOpt().merge(options);
        this.toasts.push({ title: t, message: msg, options: opt });
    }

    remove(toast: Toast) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }

}