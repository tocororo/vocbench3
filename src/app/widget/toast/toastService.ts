import { Injectable } from "@angular/core";
import { ToastOpt, UndoToast, UndoToastData } from "./Toasts";

@Injectable()
export class ToastService {
    
    toasts: UndoToast[] = [];

    show(data: UndoToastData, options?: ToastOpt) {
        this.toasts.push({ data: data, options: options });
    }

    remove(toast: UndoToast) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }

}