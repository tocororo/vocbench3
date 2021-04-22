import { Component } from "@angular/core";
import { Language, Languages } from "../../models/LanguagesCountries";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "lang-rendering-pref",
    templateUrl: "./languageRenderingComponent.html",
    styles: ['input[type=number]::-webkit-inner-spin-button { opacity: 1 }']
})
export class LanguageRenderingComponent {

    sortOrder: SortOrder = SortOrder.ISO_CODE_ASCENDING;
    renderingLanguages: LanguageItem[] = [];
    activeLangs: number = 0;

    noLangItem: LanguageItem = { lang: { name: "None", tag: Languages.NO_LANG_TAG }, active: false, position: null };

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        let projectLanguages: Language[] = VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting;
        let renderingLanguagesPref: string[] = VBContext.getWorkingProjectCtx().getProjectPreferences().renderingLanguagesPreference;

        this.renderingLanguages.push(this.noLangItem);

        if (renderingLanguagesPref.length == 1 && renderingLanguagesPref[0] == Languages.ALL_LANG) {
            //set as selected renderingLangs all the available langs
            projectLanguages.forEach(pl => {
                this.renderingLanguages.push({
                    lang: pl,
                    active: false,
                    position: null
                })
            })
        } else {
            //set as selected renderingLangs only the listed by the preference
            this.noLangItem.active = renderingLanguagesPref.includes(Languages.NO_LANG_TAG);
            projectLanguages.forEach(pl => {
                this.renderingLanguages.push({
                    lang: pl,
                    active: (renderingLanguagesPref.indexOf(pl.tag) != -1), //active if the language is among the listed in preferences
                    position: null
                })
            })
            //set the positions according to the preference order
            let position: number = 1;
            renderingLanguagesPref.forEach(langPref => {
                this.renderingLanguages.forEach((langItem: LanguageItem) => {
                    if (langItem.lang.tag == langPref) {
                        langItem.position = position;
                        return;
                    }
                })
                position++;
            })
        }
    }

    //languages handlers

    changeAllLangStatus(checked: boolean) {
        if (checked) {
            //if it's activating all the languages, position the new activated langs after the already active
            let lastPosition: number = this.countActiveLangs();
            for (let i = 0; i < this.renderingLanguages.length; i++) {
                if (!this.renderingLanguages[i].active) { //only if not yet active update active and position
                    this.renderingLanguages[i].active = checked;
                    this.renderingLanguages[i].position = lastPosition+1;
                    lastPosition++;
                }
            }
        } else {
            for (let i = 0; i < this.renderingLanguages.length; i++) {
                this.renderingLanguages[i].active = checked;
                this.renderingLanguages[i].position = null;
            }
        }
        this.updateLanguagesPref();
    }

    private updateLanguagesPref() {
        //collect the active languages to set in the preference
        let preferenceLangs: string[] = [];
        let activeLangs: LanguageItem[] = this.getActiveLanguageItems();
        //sort active langs by position
        activeLangs.sort((l1: LanguageItem, l2: LanguageItem) => {
            if (l1.position > l2.position) return 1;
            if (l1.position < l2.position) return -1;
            return 0;
        });

        activeLangs.forEach(l => {
            preferenceLangs.push(l.lang.tag);
        })
        if (preferenceLangs.length == 0) {
            preferenceLangs.push(Languages.ALL_LANG);
        }
        this.properties.setRenderingLanguagesPreference(preferenceLangs);
    }
    
    changePositionOrder() {
        if (this.sortOrder == SortOrder.POSITION_ASCENDING) {
            this.sortOrder = SortOrder.POSITION_DESCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                if (l1.position == null && l2.position == null) {
                    // return 0;
                    return l1.lang.tag.localeCompare(l2.lang.tag);
                } else if (l1.position != null && l2.position == null) {
                    return -1;
                } else if (l1.position == null && l2.position != null) {
                    return 1;
                }
                if (l1.position > l2.position) return -1;
                if (l1.position < l2.position) return 1;
                return 0;
            });
        } else { //in case is positionDescending or any other order active
            this.sortOrder = SortOrder.POSITION_ASCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                if (l1.position == null && l2.position == null) {
                    // return 0;
                    return l1.lang.tag.localeCompare(l2.lang.tag);
                } else if (l1.position != null && l2.position == null) {
                    return -1;
                } else if (l1.position == null && l2.position != null) {
                    return 1;
                }
                if (l1.position > l2.position) return 1;
                if (l1.position < l2.position) return -1;
                return 0;
            });
        }
    }
    changeIsocodeOrder() {
        if (this.sortOrder == SortOrder.ISO_CODE_ASCENDING) {
            this.sortOrder = SortOrder.ISO_CODE_DESCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.tag.localeCompare(l2.lang.tag);
            });
        } else { //in case is isocodeDescending or any other order active
            this.sortOrder = SortOrder.ISO_CODE_ASCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.tag.localeCompare(l2.lang.tag);
            });
        }
    }
    changeLanguageOrder() {
        if (this.sortOrder == SortOrder.LANGUAGE_ASCENDING) {
            this.sortOrder = SortOrder.LANGUAGE_DESCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.name.localeCompare(l2.lang.name);
            });
        } else { //in case is positionDescending or any other order active
            this.sortOrder = SortOrder.LANGUAGE_ASCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.name.localeCompare(l2.lang.name);
            });
        }
    }

    private onPositionChange(langItem: LanguageItem, newPositionValue: string) {
        let newPosition: number = parseInt(newPositionValue);
        for (let i = 0; i < this.renderingLanguages.length; i++) {
            //swap the position between the changed language and the language that was in the "newPosition"
            if (this.renderingLanguages[i].position == newPosition) {
                this.renderingLanguages[i].position = langItem.position;
                langItem.position = newPosition;
                break;
            }
        }
        this.updateLanguagesPref();
    }

    private onActiveChange(langItem: LanguageItem) {
        //if it is activating the language, set its position as last
        if (langItem.active) {
            langItem.position = this.countActiveLangs();
        } else { 
            //if deactivating language, remove position to the deactivated lang...
            let deactivatedPosition: number = langItem.position;
            langItem.position = null;
            //...and shift the position of the languages that follow the deactivated
            for (let i = 0; i < this.renderingLanguages.length; i++) {
                if (this.renderingLanguages[i].position > deactivatedPosition) {
                    this.renderingLanguages[i].position = this.renderingLanguages[i].position-1;
                }
            }

        }
        this.updateLanguagesPref();
    }

    //Utils 

    getActiveLanguageItems(): LanguageItem[] {
        let activeLangs: LanguageItem[] = [];
        for (let i = 0; i < this.renderingLanguages.length; i++) {
            if (this.renderingLanguages[i].active) {
                activeLangs.push(this.renderingLanguages[i]);
            }
        }
        return activeLangs;
    }

    private countActiveLangs(): number {
        let activeLangs: number = 0
        for (let i = 0; i < this.renderingLanguages.length; i++) {
            if (this.renderingLanguages[i].active) {
                activeLangs++;
            }
        }
        return activeLangs;
    }

}

/**
 * Support class that represent a list item of the languages preference
 */
class LanguageItem {
    public lang: Language;
    public active: boolean;
    public position: number;
}

class SortOrder {
    public static POSITION_DESCENDING: string = "position_descending";
    public static POSITION_ASCENDING: string = "position_ascending";
    public static ISO_CODE_DESCENDING: string = "isocode_descending";
    public static ISO_CODE_ASCENDING: string = "isocode_ascending";
    public static LANGUAGE_DESCENDING: string = "language_descending";
    public static LANGUAGE_ASCENDING: string = "language_ascending";
}