import { Component } from "@angular/core";
import { Language } from "../../models/LanguagesCountries";
import { VBProperties } from "../../utils/VBProperties";


@Component({
    selector: "lang-value-filter-pref",
    templateUrl: "./languageValueFilterComponent.html"
})
export class LanguageValueFilterComponent {

    private sortOrder: SortOrder = SortOrder.ISO_CODE_ASCENDING;
    
    private filterLanguages: LanguageItem[] = [];
    private filterEnabled: boolean = false;

    constructor(private vbProp: VBProperties) { }

    ngOnInit() {
        let projectLanguages: Language[] = this.vbProp.getProjectLanguages();

        let preferenceLangs: string[] = this.vbProp.getValueFilterLanguages().languages;

        if (preferenceLangs.length == 1 && preferenceLangs[0] == "*") { //"*" stands for all languages
            //set as active all the available langs
            for (var i = 0; i < projectLanguages.length; i++) {
                this.filterLanguages.push({
                    lang: projectLanguages[i],
                    active: false
                });
            }
        } else {
            //set as active only the listed by the preference
            for (var i = 0; i < projectLanguages.length; i++) {
                this.filterLanguages.push({
                    lang: projectLanguages[i],
                    active: (preferenceLangs.indexOf(projectLanguages[i].tag) != -1) //active if the language is among the listed in preferences
                });
            }
        }

        this.filterEnabled = this.vbProp.getValueFilterLanguages().enabled;
    }

    private toggleFilter() {
        this.filterEnabled = !this.filterEnabled;
        this.updatePref();
    }

    private changeAllLangStatus(checked: boolean) {
        this.filterLanguages.forEach(l => {
            l.active = checked
        })
        this.updatePref();
    }

    private updatePref() {
        //collect the active languages to set in the preference
        var preferenceLangs: string[] = [];
        var activeLangs: LanguageItem[] = this.getActiveLanguageItems();
        activeLangs.forEach(l => {
            preferenceLangs.push(l.lang.tag);
        });
        this.vbProp.setValueFilterLanguages({ languages: preferenceLangs, enabled: this.filterEnabled });
    }
    
    private changeIsocodeOrder() {
        if (this.sortOrder == SortOrder.ISO_CODE_ASCENDING) {
            this.sortOrder = SortOrder.ISO_CODE_DESCENDING;
            this.filterLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.tag.localeCompare(l2.lang.tag);
            });
        } else { //in case is isocodeDescending or any other order active
            this.sortOrder = SortOrder.ISO_CODE_ASCENDING;
            this.filterLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.tag.localeCompare(l2.lang.tag);
            });
        }
    }
    private changeLanguageOrder() {
        if (this.sortOrder == SortOrder.LANGUAGE_ASCENDING) {
            this.sortOrder = SortOrder.LANGUAGE_DESCENDING;
            this.filterLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.tag.localeCompare(l2.lang.name);
            });
        } else { //in case is positionDescending or any other order active
            this.sortOrder = SortOrder.LANGUAGE_ASCENDING;
            this.filterLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.tag.localeCompare(l2.lang.name);
            });
        }
    }

    private onActiveChange(langItem: LanguageItem) {
        this.updatePref();
    }

    //Utils 

    private getActiveLanguageItems(): LanguageItem[] {
        var activeLangs: LanguageItem[] = [];
        for (var i = 0; i < this.filterLanguages.length; i++) {
            if (this.filterLanguages[i].active) {
                activeLangs.push(this.filterLanguages[i]);
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
}

class SortOrder {
    public static POSITION_DESCENDING: string = "position_descending";
    public static POSITION_ASCENDING: string = "position_ascending";
    public static ISO_CODE_DESCENDING: string = "isocode_descending";
    public static ISO_CODE_ASCENDING: string = "isocode_ascending";
    public static LANGUAGE_DESCENDING: string = "language_descending";
    public static LANGUAGE_ASCENDING: string = "language_ascending";
}