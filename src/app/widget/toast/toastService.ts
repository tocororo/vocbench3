import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TextOrTranslation } from "../modal/Modals";
import { ToastOpt, Toast } from "./Toasts";

@Injectable()
export class ToastService {

    constructor(private translateService: TranslateService) {}
    
    toasts: Toast[] = [];

    show(title: TextOrTranslation, message: TextOrTranslation, options?: ToastOpt) {
        let t = title != null ? (typeof title == "string") ? title : this.translateService.instant(title.key, title.params) : null;
        let msg = (typeof message == "string") ? message : this.translateService.instant(message.key, message.params);
        let opt: ToastOpt = new ToastOpt().merge(options);
        this.toasts.push({ title: t, message: msg, options: opt });
    }

    remove(toast: Toast) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }

}