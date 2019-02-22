import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Language, Languages } from "../../../models/LanguagesCountries";
import { UIUtils } from "../../../utils/UIUtils";
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

    @Input() constrain: boolean = false; //if true, constrain the selection of language only to the input this.lang
    @Input() locale: boolean = false; //if true, allow the selection of also the locale of this.lang (compatibly with the user assigned langugages)
    @Input() size: string = "sm";
    @Input() disabled: boolean = false;

    private selectClass: string = "form-control input-";
    private languageList: Language[] = [];
    private language: string;
    private showFlag: boolean = true;

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        if (this.size == "xs" || this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.selectClass += this.size;
        } else {
            this.selectClass += "sm";
        }

        this.showFlag = this.properties.getShowFlags();

        //Init languages list considering only languages assigned to user and allowed in project
        this.languageList = []; //intersection between language available in project and language assigned to user.
        var projectLangs: Language[] = this.properties.getProjectLanguages();
        var userAssignedLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
        this.languageList = projectLangs.filter((l: Language) => { return userAssignedLangs.indexOf(l.tag) != -1 });
    }

    ngAfterViewInit() {
        setTimeout(() => { //timout to prevent ExpressionChangedAfterItHasBeenCheckedError in the container component
            //if there is some language available set the selected language in the picker
            if (this.languageList.length > 0) { 
                if (this.language == undefined) { //no language specified as @Input
                    //set the default editing language
                    let editingLang = this.properties.getEditingLanguage();
                    for (var j = 0; j < this.languageList.length; j++) {
                        if (this.languageList[j].tag == editingLang) {
                            this.language = this.languageList[j].tag;
                        }
                    }
                    //language null means that the default edit language is not in the in available languages, so set the selected based on the priority list
                    if (this.language == null) {
                        selectedLangLoop: 
                        for (var i = 0; i < Languages.priorityLangs.length; i++) {
                            for (var j = 0; j < this.languageList.length; j++) {
                                if (this.languageList[j].tag == Languages.priorityLangs[i]) {
                                    this.language = this.languageList[j].tag;
                                    break selectedLangLoop;
                                }
                            }
                        }
                    }
                    //language null means that no language in languageList is in priority list, so set as selected the first language available
                    if (this.language == null) {
                        this.language = this.languageList[0].tag;
                    }
                } else {
                    //lang provided => check constraints
                    if (this.constrain) {
                        this.languageList = this.languageList.filter((l: Language) => {
                            return (l.tag == this.language || (this.locale && l.tag.startsWith(this.language + "-")));
                        });
                    }
                }
            }
            this.propagateChange(this.language);
        });
    }

    private onLangChange(newLang: string) {
        this.language = newLang;
        this.propagateChange(this.language);
    }

    private getFlagImgSrc(): string {
        return UIUtils.getFlagImgSrc(this.language);
    }

    private isDisabled(): boolean {
        return this.disabled || this.languageList.length == 0;
    }

    private getMenuTitle(): string {
        if (this.languageList.length == 0) {
            return "No language assigned for the current project";
        } else {
            return this.language;
        }
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        this.language = obj;
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
    private propagateChange = (_: any) => { };

    //--------------------------------------------------

}