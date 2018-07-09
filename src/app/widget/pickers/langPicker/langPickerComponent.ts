import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { UIUtils } from "../../../utils/UIUtils";
import { VBProperties } from "../../../utils/VBProperties";
import { VBContext } from "../../../utils/VBContext";
import { Language, Languages } from "../../../models/LanguagesCountries";

@Component({
    selector: 'lang-picker',
    templateUrl: './langPickerComponent.html',
})
export class LangPickerComponent implements OnInit {

    @Input() lang: string;
    @Input() constrain: boolean = false; //if true, constrain the selection of language only to the input this.lang
    @Input() locale: boolean = false; //if true, allow the selection of also the locale of this.lang (compatibly with the user assigned langugages)
    @Input() size: string = "sm";
    @Input() disabled: boolean = false;
    @Output() langChange = new EventEmitter<any>();

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
        for (var i = 0; i < projectLangs.length; i++) {
            if (userAssignedLangs.indexOf(projectLangs[i].tag) != -1) {
                this.languageList.push(projectLangs[i]);
            }
        }

        if (this.languageList.length > 0) { //if there is some language available set the selected language in the picker
            if (this.lang == undefined) { //no language specified as @Input
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
                this.language = this.lang;
                //lang provided => check constraints
                if (this.constrain) {
                    this.languageList = this.languageList.filter((l: Language) => {
                        return (l.tag == this.lang || (this.locale && l.tag.startsWith(this.lang + "-")));
                    });
                }
            }
        }
        this.langChange.emit(this.language);//and emit langChange event (could be null => no language available for the user)
    }

    //handle the change of lang from "outside" the component and not from UI
    ngOnChanges(changes: SimpleChanges) {
        if (changes['lang']) {
            this.language = changes['lang'].currentValue;
        }
    }

    private onLangChange(newLang: string) {
        this.language = newLang;
        this.langChange.emit(newLang);
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

}