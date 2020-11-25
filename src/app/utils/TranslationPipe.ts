import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({ 
    name: 'vbTranslate',
    pure: false
})
export class TranslationPipe implements PipeTransform {

    private cachedTranslation: {
        lang: string;
        value: string
    }

    constructor(private ngxTranslate: TranslateService) {}

    transform(value: string, key: string): Observable<string> {
        let currentLang = this.ngxTranslate.currentLang
        if (this.ngxTranslate.getDefaultLang() != currentLang) { //current used lang is not the default one
            if (this.cachedTranslation != null && this.cachedTranslation.lang == currentLang) { //already translated previously => return cached translation
                return of(this.cachedTranslation.value);
            } else { //not yet translated => use the ngx-translation service and cache the result
                return this.ngxTranslate.get(key).pipe(
                    map((translation: string) => {
                        return translation;
                    })
                );
            }
        } else { //using the default language (en) no need to translate
            return of(value);
        }
    }
}