export interface Toast {
    title: string;
    message: string;
    options?: ToastOpt;
}

export interface ToastOpt {
    toastClass?: string;
    textClass?: string;
    delay?: number;
}
