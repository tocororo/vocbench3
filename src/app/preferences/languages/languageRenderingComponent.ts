import { Component } from "@angular/core";
import { Language } from "../../models/LanguagesCountries";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "lang-rendering-pref",
    templateUrl: "./languageRenderingComponent.html",
    styles: ['input[type=number]::-webkit-inner-spin-button { opacity: 1 }']
})
export class LanguageRenderingComponent {

    private sortOrder: SortOrder = SortOrder.ISO_CODE_ASCENDING;
    private renderingLanguages: LanguageItem[] = [];
    private activeLangs: number = 0;

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        var projectLanguages: Language[] = this.properties.getProjectLanguages();
        let renderingLanguages: string[] = this.properties.getLanguagesPreference();
        if (renderingLanguages.length == 1 && renderingLanguages[0] == "*") { //"*" stands for all languages
            //set as selected renderingLangs all the available langs
            for (var i = 0; i < projectLanguages.length; i++) {
                this.renderingLanguages.push({
                    lang: projectLanguages[i],
                    active: false,
                    position: null
                });
            }
        } else {
            //set as selected renderingLangs only the listed by the preference
            for (var i = 0; i < projectLanguages.length; i++) {
                this.renderingLanguages.push({
                    lang: projectLanguages[i],
                    active: (renderingLanguages.indexOf(projectLanguages[i].tag) != -1), //active if the language is among the listed in preferences
                    position: null
                });
            }
            //set the positions according to the preference order
            let position: number = 1; //here I didn't exploit index i since a lang in preferences could be not in the project langs
            for (var i = 0; i < renderingLanguages.length; i++) {
                let langTag: string = renderingLanguages[i];
                this.renderingLanguages.forEach((lang: LanguageItem) => {
                    if (lang.lang.tag == langTag) {
                        lang.position = position;
                        return;
                    }
                })
                position++;
            }
        }

    }

    //languages handlers

    private changeAllLangStatus(checked: boolean) {
        if (checked) {
            //if it's activating all the languages, position the new activated langs after the already active
            let lastPosition: number = this.countActiveLangs();
            for (var i = 0; i < this.renderingLanguages.length; i++) {
                if (!this.renderingLanguages[i].active) { //only if not yet active update active and position
                    this.renderingLanguages[i].active = checked;
                    this.renderingLanguages[i].position = lastPosition+1;
                    lastPosition++;
                }
            }
        } else {
            for (var i = 0; i < this.renderingLanguages.length; i++) {
                this.renderingLanguages[i].active = checked;
                this.renderingLanguages[i].position = null;
            }
        }
        this.updateLanguagesPref();
    }

    private updateLanguagesPref() {
        //collect the active languages to set in the preference
        var preferenceLangs: string[] = [];
        var activeLangs: LanguageItem[] = this.getActiveLanguageItems();
        //sort active langs by position
        activeLangs.sort((l1: LanguageItem, l2: LanguageItem) => {
            if (l1.position > l2.position) return 1;
            if (l1.position < l2.position) return -1;
            return 0;
        });

        if (activeLangs.length == 0) { //no language checked
            preferenceLangs = ["*"];
        } else {
            activeLangs.forEach(l => {
                preferenceLangs.push(l.lang.tag);
            })
        }
        this.properties.setLanguagesPreference(preferenceLangs);
    }
    
    private changePositionOrder() {
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
    private changeIsocodeOrder() {
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
    private changeLanguageOrder() {
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
        for (var i = 0; i < this.renderingLanguages.length; i++) {
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
            for (var i = 0; i < this.renderingLanguages.length; i++) {
                if (this.renderingLanguages[i].position > deactivatedPosition) {
                    this.renderingLanguages[i].position = this.renderingLanguages[i].position-1;
                }
            }

        }
        this.updateLanguagesPref();
    }

    //Utils 

    private getActiveLanguageItems(): LanguageItem[] {
        var activeLangs: LanguageItem[] = [];
        for (var i = 0; i < this.renderingLanguages.length; i++) {
            if (this.renderingLanguages[i].active) {
                activeLangs.push(this.renderingLanguages[i]);
            }
        }
        return activeLangs;
    }

    private countActiveLangs(): number {
        let activeLangs: number = 0
        for (var i = 0; i < this.renderingLanguages.length; i++) {
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