import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {ResourceUtils} from "../../utils/ResourceUtils";
import {Languages} from "../../utils/LanguagesCountries";
import {VocbenchCtx} from "../../utils/VocbenchCtx";

@Component({
    selector: 'lang-picker',
    templateUrl: './langPickerComponent.html',
})
export class LangPickerComponent implements OnInit {
    
    @Input() lang: string;
    @Input() size: string = "sm";
    @Input() disabled: boolean = false;
    @Output() langChange = new EventEmitter<any>();
    
    private selectClass: string = "form-control input-";
    private languageList = Languages.languageList;
    private language: string;
    
    constructor(private vbCtx: VocbenchCtx) { }

    ngOnInit() {
        if (this.size == "xs" || this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.selectClass += this.size;
        } else {
            this.selectClass += "sm";
        }
        if (this.lang == undefined) {
            this.language = this.vbCtx.getContentLanguage();//if lang is not provided set the content language
            this.langChange.emit(this.language);//and emit langChange event
        } else {
            this.language = this.lang;
        }
    }
    
    //handle the change of lang from "outside" the component and not from UI
    ngOnChanges(changes) {
        if (changes.lang) {
            this.language = changes.lang.currentValue;
        }
    }
    
    private onLangChange(newLang) {
        this.language = newLang;
        this.langChange.emit(newLang);
    }
    
    private getFlagImgSrc(): string {
        return ResourceUtils.getFlagImgSrc(this.language);
    }
    
}