import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Transition } from 'd3';

export enum ModalType {
    info = "info",
    warning = "warning",
    error = "error"
}

export class ModalOptions implements NgbModalOptions {

    backdrop?: boolean | 'static';
    size?: 'sm' | 'lg'; //standard size admitted by ng-bootstrap modals

    /**
     * 
     * @param size available values: sm, lg (standard for ng-bootstrap), xl and xxl
     * @param backdrop 
     */
    constructor(size?: 'sm' | 'lg' | 'xl' | 'full', backdrop?: boolean | 'static') {
        this.backdrop = (backdrop) ? backdrop : "static"; //default 'static'
        if (size) {
            if (size == "xl") {
                //workaround to apply custom size: https://github.com/ng-bootstrap/ng-bootstrap/issues/1309#issuecomment-289310540
                this.size = "xl" as "lg";
            } else if (size == "full") {
                this.size = "full" as "lg";
            } else { //'sm' or 'lg' are accepted size
                this.size = size;
            }
        }
    }

    merge(options?: ModalOptions): ModalOptions {
        if (options) {
            if (options.backdrop) this.backdrop = options.backdrop;
            if (options.size) this.size = options.size;
        }
        return this;
    }

}

/**
 * string if the provided text doesn't need to be translated
 * Translation if needs to be translated
 */
export type TextOrTranslation = string | Translation;

/**
 * key is the translation key, params is the optional interpolation params object
 */
export interface Translation { key: string, params?: {} }

export class SelectionOption {
    value: string;
    description: string;
}