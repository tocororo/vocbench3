export interface UndoToast {
    data: UndoToastData;
    options?: ToastOpt;
}

export interface ToastOpt {
    toastClass?: string;
    textClass?: string;
    delay?: number;
}

export interface UndoToastData {
    title: string;
    message: string;
}