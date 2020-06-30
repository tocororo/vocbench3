import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Language, Languages } from "../../../models/LanguagesCountries";
import { VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";

@Component({
    selector: 'lang-picker',
    templateUrl: './langPickerComponent.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LangPickerComponent), multi: true,
    }]
})
export class LangPickerComponent implements ControlValueAccessor {

    @Input() size: string = "sm";
    @Input() disabled: boolean = false;
    @Input() readonly: boolean = false;

    @Input() config: LangPickerConfig;

    private selectClass: string = "form-control input-";
    private languageList: Language[] = [];
    private language: Language;
    private showFlag: boolean = true;

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        if (this.size == "xs" || this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.selectClass += this.size;
        } else {
            this.selectClass += "sm";
        }

        let defaultConfig = new LangPickerConfig();
        if (this.config == null) {
            this.config = defaultConfig;
        } else { //merge provided config (it could be incomplete) with the default values
            this.config.constrain = this.config.constrain != null ? this.config.constrain : defaultConfig.constrain;
            this.config.languages = this.config.languages != null ? this.config.languages : defaultConfig.languages;
            this.config.locale = this.config.locale != null ? this.config.locale : defaultConfig.locale;
        }

        this.showFlag = this.properties.getShowFlags();

        //Init languages list considering only languages assigned to user and allowed in project
        this.languageList = []; //intersection between language available in project and language assigned to user.
        var projectLangs: Language[] = VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting;
        var userAssignedLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
        if (userAssignedLangs.length == 0 && VBContext.getLoggedUser().isAdmin()) {
            this.languageList = projectLangs; //in case of admin user with no lang assigned => available langs are all the project langs
        } else {
            this.languageList = projectLangs.filter((l: Language) => { return userAssignedLangs.indexOf(l.tag) != -1 });
        }
        //if configuration provide language limitation, filter also according them
        if (this.config.languages != null) {
            this.languageList = projectLangs.filter((l: Language) => { return this.config.languages.indexOf(l.tag) != -1 });
        }
    }

    ngAfterViewInit() {
        setTimeout(() => { //timout to prevent ExpressionChangedAfterItHasBeenCheckedError in the container component
            //if there is some language available set the selected language in the picker
            if (this.languageList.length > 0) { 
                if (this.language == undefined) { //no language specified as @Input
                    //set the default editing language
                    let editingLang: string = VBContext.getWorkingProjectCtx().getProjectPreferences().editingLanguage;
                    this.language = this.languageList.find(l => l.tag == editingLang);
                    //language null means that the default edit language is not in the in available languages, so set the selected based on the priority list
                    if (this.language == null) {
                        for (let priorityLang of Languages.priorityLangs) {
                            this.language = this.languageList.find(l => l.tag == priorityLang);
                            if (this.language != null) break;
                        }
                    }
                    //language null means that no language in languageList is in priority list, so set as selected the first language available
                    if (this.language == null) {
                        this.language = this.languageList[0];
                    }
                } else {
                    //lang provided => check constraints
                    if (this.config.constrain) {
                        this.languageList = this.languageList.filter((l: Language) => {
                            return (l.tag == this.language.tag || (this.config.locale && l.tag.startsWith(this.language.tag + "-")));
                        });
                        this.language = this.languageList.find(l => l.tag == this.language.tag);
                    }
                }
            }
            this.onLangChange();
        });
    }

    private onLangChange() {
        let langTag = this.language != null ? this.language.tag : null;
        this.propagateChange(langTag);
    }

    private isDisabled(): boolean {
        return this.disabled || this.languageList.length == 0;
    }

    private getMenuTitle(): string {
        if (this.languageList.length == 0) {
            return "No language assigned for the current project";
        } else {
            return this.language != null ? this.language.tag : null;
        }
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        this.language = Languages.getSystemLanguages().find(l => l.tag == obj)
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: string) => { };

    //--------------------------------------------------

}

export class LangPickerConfig {
    constrain: boolean = false; //if true, the selection of language is constrained only to the bound language (language set through ngModel)
    locale: boolean = false; //(used only when constrain is true) if true, the language selection allows also the locales of the bound language (compatibly with the user assigned langugages)
    languages: string[]; //if provided, the available languages are limited to these language tags (compatibly with the user assigned langugages)
}