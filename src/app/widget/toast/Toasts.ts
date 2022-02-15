export interface Toast {
    title: string;
    message: string;
    options?: ToastOpt;
}

export class ToastOpt {

    toastClass: string;
    textClass: string;
    delay: number;
    
    constructor({toastClass, textClass, delay}: ToasOptArgs = {}) {
        this.toastClass = toastClass != null ? toastClass : "bg-theme-0";
        this.textClass = textClass != null ? textClass : "text-white";
        this.delay = delay != null ? delay : 4000;
    }

    merge(options?: ToastOpt): ToastOpt {
        return new ToastOpt({
            toastClass: options && options.toastClass != null ? options.toastClass : this.toastClass,
            textClass: options && options.textClass != null ? options.textClass : this.textClass,
            delay: options && options.delay != null ? options.delay : this.delay
        });
    }

}

interface ToasOptArgs {
    toastClass?: string;
    textClass?: string;
    delay?: number;
}