import { Injectable } from '@angular/core';
import { PreferencesServices } from '../services/preferencesServices';

@Injectable()
export class VBPreferences {

    private showFlags: boolean = true;
    private languages: string[] = []; //contains langTag or a single element "*" that means all languages

    constructor(private prefService: PreferencesServices) {}

    /**
     * To call each time the user change project
     */
    initUserProjectPreferences() {
        this.prefService.getProjectPreferences().subscribe(
            prefs => {
                this.showFlags = prefs.showFlags;
                this.languages = prefs.languages;
            }
        )
    }

    getShowFlags(): boolean {
        return this.showFlags;
    }
    setShowFlags(show: boolean) {
        this.showFlags = show;
        this.prefService.setShowFlags(show).subscribe();
    }

    getLanguages(): string[] {
        return this.languages;
    }
    setLanguages(langs: string[]) {
        this.languages = langs;
        this.prefService.setLanguages(langs).subscribe()
    }

    /**
     * Returns the default language, used to select the language when creating a resource with lang
     * Returns the first lang of languages array or "en" in case languages is *
     */
    getDefaultLanguage() {
        var firstLang = this.languages[0];
        if (firstLang == "*") {
            return "en";
        }
        return firstLang;
    }

}