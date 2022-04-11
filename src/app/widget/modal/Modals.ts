import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

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
export interface Translation { key: string, params?: { [key: string]: any} }

export class SelectionOption {
    value: string;
    description: string;
}

export class TranslationUtils {

    static getTranslatedText(textOrTranslation: TextOrTranslation, translateService: TranslateService): string {
        if (textOrTranslation == null) return null;
        if (typeof textOrTranslation == "string") {
            return textOrTranslation;
        } else {
            return translateService.instant(textOrTranslation.key, textOrTranslation.params);
        }
    }

    /**
     * Replaces the values of the given keys with the related translation in the provided object.
     * Values assigned to keysToTranslate are expected to be TextOrTranslation.
     * Returns the same object with the values translated
     * @param object 
     * @param keysToTranslate 
     * @param translateService 
     */
    static translateObject(object: {[key: string]: any}, keysToTranslate: string[], translateService: TranslateService): {[key: string]: any} {
        if (object == null) return null;
        for (let key of keysToTranslate) {
            if (object[key] != null) {
                object[key] = this.getTranslatedText(object[key], translateService);
            }
        }
        return object;
    }

}